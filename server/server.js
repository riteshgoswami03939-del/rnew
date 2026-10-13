const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

// Customer Schema
const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      default: "Male",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    productName: {
      type: String,
      required: true,
    },

    productAmount: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      required: true,
    },

    debit: {
      type: Number,
      required: true,
    },

    finalAmount: {
      type: Number,
      required: true,
    },

    purchaseDate: {
      type: String,
      default: "",
    },

    purchaseTime: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

// ===============================
// GET ALL CUSTOMERS
// ===============================
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({
      createdAt: -1,
    });

    res.json(customers);
  } catch (error) {
    console.log("Fetch Error:", error.message);

    res.status(500).json({
      message: "Records nahi mile",
      error: error.message,
    });
  }
});

// ===============================
// SAVE CUSTOMER
// ===============================
app.post("/api/customers", async (req, res) => {
  try {
    console.log("Received Data:", req.body);

    const customer = await Customer.create(req.body);

    res.status(201).json({
      message: "Customer successfully save ho gaya",
      customer,
    });
  } catch (error) {
    console.log("Save Error:", error.message);

    res.status(500).json({
      message: "Customer save nahi hua",
      error: error.message,
    });
  }
});

// ===============================
// DELETE CUSTOMER
// ===============================
app.delete("/api/customers/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      message: "Customer delete ho gaya",
    });
  } catch (error) {
    console.log("Delete Error:", error.message);

    res.status(500).json({
      message: "Delete nahi hua",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE CUSTOMER
// ===============================
app.put("/api/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(customer);
  } catch (error) {
    console.log("Update Error:", error.message);

    res.status(500).json({
      message: "Update nahi hua",
      error: error.message,
    });
  }
});

// ===============================
// TEST SERVER
// ===============================
app.get("/", (req, res) => {
  res.send("Customer Purchase Server is Running");
});

// ===============================
// START SERVER
// ===============================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});