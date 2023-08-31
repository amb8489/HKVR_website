const express = require("express");
const router = express.Router();

// where functions for get post update delete are
const notesController = require("../controllers/notesController");

// /notes/
router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNewNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

module.exports = router;
