const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getData, saveData } = require("../dataService");

// Get all notes for a user
router.get("/", auth, async (req, res) => {
  try {
    const data = await getData();
    const userNotes =
      data.notes?.filter((note) => note.userId === req.userId) || [];
    res.json(userNotes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// Create a new note
router.post("/", auth, async (req, res) => {
  try {
    const data = await getData();
    const newNote = {
      id: Date.now().toString(),
      userId: req.userId,
      title: req.body.title,
      content: req.body.content,
      linkedTaskId: req.body.linkedTaskId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.notes = data.notes || [];
    data.notes.push(newNote);
    await saveData(data);

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Error creating note" });
  }
});

// Update a note
router.put("/:id", auth, async (req, res) => {
  try {
    const data = await getData();
    const noteIndex = data.notes?.findIndex(
      (note) => note.id === req.params.id && note.userId === req.userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: "Note not found" });
    }

    const updatedNote = {
      ...data.notes[noteIndex],
      title: req.body.title,
      content: req.body.content,
      linkedTaskId: req.body.linkedTaskId,
      updatedAt: new Date().toISOString(),
    };

    data.notes[noteIndex] = updatedNote;
    await saveData(data);

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Error updating note" });
  }
});

// Delete a note
router.delete("/:id", auth, async (req, res) => {
  try {
    const data = await getData();
    const noteIndex = data.notes?.findIndex(
      (note) => note.id === req.params.id && note.userId === req.userId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: "Note not found" });
    }

    data.notes.splice(noteIndex, 1);
    await saveData(data);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
});

module.exports = router;
