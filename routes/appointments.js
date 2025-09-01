// routes/appointments.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single appointment
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post("/", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();

    // Here you could add email notification logic
    // await sendAppointmentConfirmation(savedAppointment);

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment status
router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by status
router.get("/status/:status", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      status: req.params.status,
    }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
