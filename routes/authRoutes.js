const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");
const verifyJWT = require("../middleware/verifyJWT");

// log in refresh and logout
router.route("/").post(loginLimiter, authController.login);

router.route("/refresh").get(authController.refresh);

router.use(verifyJWT);
router.route("/logout").post(authController.logout);

module.exports = router;
