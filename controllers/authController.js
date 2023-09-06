const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logEvents } = require("../middleware/logger");

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { username, password } = req.body;

  // check for username and password
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check that user exists
  const foundUser = await User.findOne({ username }).exec();

  // if a user is not found or is not active
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // check password
  const match = await bcrypt.compare(password, foundUser.password);

  // wrong password
  if (!match) return res.status(401).json({ message: "Unauthorized" });

  // make and send a new accessToken
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    // sign with our ACCESS_TOKEN_SECRET
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  // make new refresh token
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match refresh token
  });
  logEvents(`${username} logged in`, "reqLog.log");

  // Send accessToken containing username and roles
  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  // get the cookies
  const cookies = req.cookies;

  // no cookie
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  // check that the jwt is correct
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,

    // decoded info from jwt
    async (err, decoded) => {
      // bad token or refresh exprired
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // get user
      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      // no user found with that username
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      // new accessToken
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// // @access Private - just to clear cookie if exists
const logout = (req, res) => {
  logEvents(`${req.user} logged out`, "reqLog.log");

  // remove jwt cookies
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
