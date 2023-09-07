const User = require("../models/User");
const bcrypt = require("bcrypt");

const { logEvents } = require("../middleware/logger");

// @desc Get all users that user is following
// @route GET /follow
// @access Private
const getFollowing = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Does the user exist to update?
    const user = await User.findById(user_id).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ following: user.following });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while getting the users following" });
  }
};

// @desc follow new user
// @route POST /follow
// @access Private
const followNewUser = async (req, res) => {
  const { follow_id, user_id } = req.body;

  // Confirm data
  if (!user_id || !follow_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the user and the user to follow
    const user = await User.findById(user_id).exec();
    const follow = await User.findById(follow_id).exec();

    // Check if both users exist
    if (!user || !follow) {
      return res.status(400).json({ message: "User(s) not found" });
    }

    // Check if user is already following
    if (user.following.includes(follow._id)) {
      return res
        .status(200)
        .json({ message: "You are already following this user." });
    }

    // Update the user's following list and save both users
    user.following.push(follow._id);
    await user.save();
    await follow.save();

    // Log the event
    logEvents(
      `${user.username} followed: ${follow.username}`,
      "userActions.log"
    );

    res.status(201).json({ message: `User followed` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while following the user" });
  }
};

// @desc unfollow a user
// @route PATCH /follow
// @access Private
const unfollowUser = async (req, res) => {
  const { unfollow_id, user_id } = req.body;

  // Confirm data
  if (!user_id || !unfollow_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the user and the user to unfollow
    const user = await User.findById(user_id).exec();
    const unfollow = await User.findById(unfollow_id).exec();

    // Check if both users exist
    if (!user || !unfollow) {
      return res.status(400).json({ message: "User(s) not found" });
    }

    // Check if user is already not following
    if (!user.following.includes(unfollow._id)) {
      return res
        .status(200)
        .json({ message: "You are not following this user." });
    }

    // Remove the unfollow user's reference from the following list
    user.following = user.following.filter(
      (userId) => userId.toString() !== unfollow_id
    );

    await user.save();

    res.status(200).json({ message: `User unfollowed` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while unfollowing the user" });
  }
};

module.exports = {
  getFollowing,
  followNewUser,
  unfollowUser,
};
