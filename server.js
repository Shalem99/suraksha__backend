const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const SibApiV3Sdk = require("@getbrevo/brevo");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================== Middleware ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== MongoDB Connection ==================
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// ================== BREVO EMAIL SETUP ==================
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

let brevo = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendEmail({ to, subject, text }) {
  try {
    let sendSmtpEmail = {
<<<<<<< HEAD
      sender: {
        email: "noreply@surakshacarcare.com",
        name: "Suraksha Car Care",
      },
=======
      sender: { email: "noreply@surakshacarcare.com", name: "Suraksha Car Care" },
>>>>>>> 18833222a0ce43ef8106707099fdfa688950eaeb
      to: [{ email: to }],
      subject,
      textContent: text,
    };

    await brevo.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message || err);
  }
}

// ================== ROUTES ==================

// ----- Book Appointment -----
app.post("/api/appointments", async (req, res) => {
  try {
<<<<<<< HEAD
    const {
      name,
      email,
      phone,
      service,
      date,
      time,
      address,
      carModel,
      message,
    } = req.body;
=======
    const { name, email, phone, service, date, time, address, carModel, message } =
      req.body;
>>>>>>> 18833222a0ce43ef8106707099fdfa688950eaeb

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

    res.status(201).json({
<<<<<<< HEAD
      message:
        "Appointment booked successfully (emails will be sent in background)",
=======
      message: "Appointment booked successfully (emails will be sent in background)",
>>>>>>> 18833222a0ce43ef8106707099fdfa688950eaeb
      appointment: saved,
    });

    // 📩 Send emails asynchronously
    setImmediate(async () => {
      await sendEmail({
        to: process.env.EMAIL_USER || "youradmin@example.com",
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
      });

      await sendEmail({
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
    });
  } catch (err) {
    console.error("❌ Error booking appointment:", err);
<<<<<<< HEAD
    res
      .status(400)
      .json({ message: "Error booking appointment", error: err.message });
=======
    res.status(400).json({ message: "Error booking appointment", error: err.message });
>>>>>>> 18833222a0ce43ef8106707099fdfa688950eaeb
  }
});

// ----- Contact Form -----
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = new Contact({ name, email, phone, subject, message });
    const saved = await contact.save();

    res.status(201).json({
<<<<<<< HEAD
      message:
        "Message received successfully (emails will be sent in background)",
=======
      message: "Message received successfully (emails will be sent in background)",
>>>>>>> 18833222a0ce43ef8106707099fdfa688950eaeb
      contact: saved,
    });

    // 📩 Send emails asynchronously
    setImmediate(async () => {
      await sendEmail({
        to: process.env.EMAIL_USER || "youradmin@example.com",
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

      await sendEmail({
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
    });
  } catch (err) {
    console.error("❌ Error saving contact:", err);
<<<<<<< HEAD
    res
      .status(400)
      .json({ message: "Error sending message", error: err.message });
=======
    res.status(400).json({ message: "Error sending message", error: err.message });
>>>>>>> 18833222a0ce43ef8106707099fdfa688950eaeb
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
