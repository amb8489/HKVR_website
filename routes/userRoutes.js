const express = require("express");
const router = express.Router();

// where functions for get post update delete are
const usersController = require("../controllers/usersController");

//   /user/
router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
