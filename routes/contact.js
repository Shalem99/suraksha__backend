const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// Get all contact messages
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single contact message
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new contact message
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const savedContact = await contact.save();

    // Here you could add email notification logic
    // await sendContactNotification(savedContact);

    res.status(201).json({
      message: "Message sent successfully",
      contact: savedContact,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update contact message status
router.put("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete contact message
router.delete("/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }
    res.json({ message: "Contact message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
