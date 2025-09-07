const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================== Middleware ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== MongoDB Connection ==================
mongoose
  .connect(
    process.env.MONGODB_URI,
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
    address: { type: String },
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
  host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
  port: process.env.EMAIL_PORT, // 587
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,         // ♻️ reuse connections
  maxConnections: 5,  // up to 5 connections
  maxMessages: 100,   // reuse a connection for 100 emails
});

// ✅ Verify transporter
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Nodemailer error:", err);
  } else {
    console.log("✅ Nodemailer is ready to send emails");
  }
});

// ================== ROUTES ==================

// ----- Book Appointment -----
app.post("/api/appointments", async (req, res) => {
  try {
    const { name, email, phone, service, date, time, address, carModel, message } =
      req.body;

    const appointment = new Appointment({
      name,
      email,
      phone,
      service,
      date: new Date(date),
      time,
      address,
      carModel,
      message,
    });

    const saved = await appointment.save();

    // ✅ Respond immediately
    res.status(201).json({
      message: "Appointment booked successfully (emails will be sent in background)",
      appointment: saved,
    });

    // 📩 Send emails in background
    setImmediate(async () => {
      try {
        await Promise.all([
          // Admin email
          transporter.sendMail({
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
Address: ${saved.address || "N/A"}
Message: ${saved.message || "N/A"}
            `,
          }),

          // Customer confirmation
          transporter.sendMail({
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
          }),
        ]);
        console.log("✅ Appointment emails sent");
      } catch (mailErr) {
        console.error("❌ Appointment email failed:", mailErr);
      }
    });
  } catch (err) {
    console.error("❌ Error booking appointment:", err);
    res.status(400).json({
      message: "Error booking appointment",
      error: err.message,
    });
  }
});

// ----- Contact Form -----
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = new Contact({ name, email, phone, subject, message });
    const saved = await contact.save();

    // ✅ Respond immediately
    res.status(201).json({
      message: "Message received successfully (emails will be sent in background)",
      contact: saved,
    });

    // 📩 Send emails in background
    setImmediate(async () => {
      try {
        await Promise.all([
          // Admin email
          transporter.sendMail({
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
          }),

          // Customer confirmation
          transporter.sendMail({
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
          }),
        ]);
        console.log("✅ Contact emails sent");
      } catch (mailErr) {
        console.error("❌ Contact email failed:", mailErr);
      }
    });
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    res.status(400).json({
      message: "Error sending message",
      error: err.message,
    });
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
