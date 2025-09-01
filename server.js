// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== MongoDB Connection ==================
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/suraksha-car-care",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================== MODELS ==================
const appointmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    carModel: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Appointment = mongoose.model("Appointment", appointmentSchema);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);
const Contact = mongoose.model("Contact", contactSchema);

// ================== EMAIL SETUP ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // your Gmail App Password
  },
});

// ================== ROUTES ==================

// ----- Appointments -----
app.post("/api/appointments", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const saved = await appointment.save();

    // 📩 Email to admin
    await transporter.sendMail({
      from: `"Suraksha Car Care" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🚗 New Appointment Booked",
      text: `
New booking received:

Name: ${saved.name}
Email: ${saved.email}
Phone: ${saved.phone}
Service: ${saved.service}
Date: ${saved.date.toDateString()} at ${saved.time}
Car: ${saved.carModel}
Address: ${saved.address}
Message: ${saved.message || "N/A"}
      `,
    });

    // 📩 Confirmation to customer
    await transporter.sendMail({
      from: `"Suraksha Car Care" <${process.env.EMAIL_USER}>`,
      to: saved.email,
      subject: "✅ Appointment Confirmation",
      text: `
Hi ${saved.name},

Your appointment has been successfully booked with Suraksha Car Care.

📅 Date: ${saved.date.toDateString()}
⏰ Time: ${saved.time}
🔧 Service: ${saved.service}
🚗 Car: ${saved.carModel}

We will contact you shortly. Thank you for choosing us!

- Suraksha Car Care Team
      `,
    });

    res.status(201).json({
      message: "Appointment booked & emails sent successfully",
      appointment: saved,
    });
  } catch (err) {
    console.error("❌ Error booking appointment:", err);
    res.status(400).json({ message: "Error booking appointment" });
  }
});

// ----- Contact -----
app.post("/api/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const saved = await contact.save();

    // 📩 Email to admin
    await transporter.sendMail({
      from: `"Suraksha Car Care" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact Form: ${saved.subject}`,
      text: `
New contact form submission:

Name: ${saved.name}
Email: ${saved.email}
Phone: ${saved.phone || "N/A"}
Subject: ${saved.subject}
Message: ${saved.message}
      `,
    });

    // 📩 Confirmation to customer
    await transporter.sendMail({
      from: `"Suraksha Car Care" <${process.env.EMAIL_USER}>`,
      to: saved.email,
      subject: "✅ We Received Your Message",
      text: `
Hi ${saved.name},

Thank you for contacting Suraksha Car Care.
We have received your message and our team will get back to you soon.

📌 Subject: ${saved.subject}
💬 Message: ${saved.message}

- Suraksha Car Care Team
      `,
    });

    res.status(201).json({
      message: "Message sent & emails delivered successfully",
      contact: saved,
    });
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    res.status(400).json({ message: "Error sending message" });
  }
});

// ================== BASIC ROUTE ==================
app.get("/", (req, res) => {
  res.json({ message: "SURAKSHA CAR CARE API is running!" });
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
