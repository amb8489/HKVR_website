const mongoose = require("mongoose");
// DB model for user
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    default: ["Employee"],
  },

  active: {
    type: Boolean,
    default: true,
  },
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
