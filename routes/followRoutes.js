const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT);

// /follow
router
  .route("/")
  .get(followController.getFollowing)
  .post(followController.followNewUser)
  .delete(followController.unfollowUser);

module.exports = router;
