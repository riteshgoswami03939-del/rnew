const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config({
  path: __dirname + "/src/.env",
});

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// MONGODB CONNECTION
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

// ===============================
// CUSTOMER SCHEMA
// ===============================
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

    // ===============================
    // TRANSACTION TYPE
    // ===============================
    transactionType: {
      type: String,
      enum: ["Fullpayment", "Booking Emi"],
      default: "Fullpayment",
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
      default: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
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
    console.log("GET Error:", error);

    res.status(500).json({
      message: "Customer records load nahi hue.",
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

    const customer = await Customer.create({
      ...req.body,
      transactionType: req.body.transactionType || "Fullpayment",
    });

    res.status(201).json(customer);
  } catch (error) {
    console.log("POST Error:", error);

    res.status(500).json({
      message: "Customer save nahi hua.",
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
      {
        ...req.body,
        transactionType: req.body.transactionType || "Fullpayment",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer record nahi mila.",
      });
    }

    res.json(customer);
  } catch (error) {
    console.log("PUT Error:", error);

    res.status(500).json({
      message: "Customer update nahi hua.",
      error: error.message,
    });
  }
});

// ===============================
// DELETE CUSTOMER
// ===============================
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer record nahi mila.",
      });
    }

    res.json({
      message: "Customer delete ho gaya.",
    });
  } catch (error) {
    console.log("DELETE Error:", error);

    res.status(500).json({
      message: "Delete nahi hua.",
      error: error.message,
    });
  }
});

// ===============================

// ===============================
// DEBIT / BUYBACK MODEL
// ===============================
const debitBuybackSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, default: "Male" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  pincode: { type: String, default: "" },
  voucherType: {
    type: String,
    enum: ["Debit Voucher", "Buyback Voucher"],
    required: true
  },
  productName: { type: String, required: true },
  transactionType: { type: String, default: "Fullpayment" },
  productAmount: { type: Number, required: true },
  finalAmount: { type: Number, default: 0 },
  percentage: { type: Number, required: true },
  adjustmentAmount: { type: Number, required: true },
  actualAmount: { type: Number, required: true },
  cashAmount: { type: Number, default: 0 },
  bankAmount: { type: Number, required: true },
  purchaseDate: { type: String, default: "" },
  purchaseTime: { type: String, default: "" },
  remarks: { type: String, default: "" }
}, { timestamps: true });

const DebitBuyback = mongoose.model(
  "DebitBuyback",
  debitBuybackSchema
);

// ===============================
// SAVE DEBIT / BUYBACK
// ===============================
app.post("/api/debit-buybacks", async (req, res) => {
  try {
    const data = req.body;

    const productAmount = Number(data.productAmount);
    const finalAmount = Number(data.finalAmount ?? data.productAmount);
    const percentage = Number(data.percentage);
    const cashAmount = Number(data.cashAmount || 0);

    if (
      !data.customerName?.trim() ||
      !/^[0-9]{10}$/.test(String(data.mobile || "")) ||
      !data.productName?.trim() ||
      !["Debit Voucher", "Buyback Voucher"].includes(data.voucherType) ||
      !Number.isFinite(productAmount) ||
      productAmount <= 0 ||
      !Number.isFinite(finalAmount) ||
      finalAmount <= 0 ||
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100 ||
      !Number.isFinite(cashAmount) ||
      cashAmount < 0
    ) {
      return res.status(400).json({
        message: "Form ki details check karein. Amount, percentage ya mobile galat hai."
      });
    }

    const existingTransactions = await DebitBuyback.countDocuments({
      mobile: String(data.mobile)
    });

    if (existingTransactions >= 2) {
      return res.status(400).json({
        message: "Is customer ke Debit + Buyback mila kar maximum 2 transactions allowed hain."
      });
    }

    const adjustmentAmount = finalAmount * percentage / 100;
    const actualAmount = finalAmount - adjustmentAmount;
    const bankAmount = actualAmount - cashAmount;

    if (cashAmount > actualAmount) {
      return res.status(400).json({
        message: "Cash Amount, Actual Amount se zyada nahi ho sakta."
      });
    }

    const saved = await DebitBuyback.create({
      customerName: data.customerName.trim(),
      mobile: String(data.mobile),
      gender: data.gender || "Male",
      city: data.city || "",
      state: data.state || "",
      pincode: data.pincode || "",
      voucherType: data.voucherType,
      productName: data.productName.trim(),
      transactionType: data.transactionType || "Fullpayment",
      productAmount,
      finalAmount,
      percentage,
      adjustmentAmount,
      actualAmount,
      cashAmount,
      bankAmount,
      purchaseDate: data.purchaseDate || "",
      purchaseTime: data.purchaseTime || "",
      remarks: data.remarks || ""
    });

    res.status(201).json({
      message: "Debit / Buyback data MongoDB mein save ho gaya.",
      record: saved
    });
  } catch (error) {
    console.error("Debit/Buyback Save Error:", error);
    res.status(500).json({
      message: "Debit / Buyback data save nahi hua.",
      error: error.message
    });
  }
});

// ===============================
// UPDATE EXISTING DEBIT / BUYBACK
// ===============================
app.put("/api/debit-buybacks/:id", async (req, res) => {
  try {
    const data = req.body;
    const productAmount = Number(data.productAmount);
    const finalAmount = Number(data.finalAmount ?? data.productAmount);
    const percentage = Number(data.percentage);
    const cashAmount = Number(data.cashAmount || 0);

    if (
      !data.customerName?.trim() ||
      !/^[0-9]{10}$/.test(String(data.mobile || "")) ||
      !data.productName?.trim() ||
      !["Debit Voucher", "Buyback Voucher"].includes(data.voucherType) ||
      !Number.isFinite(productAmount) ||
      productAmount <= 0 ||
      !Number.isFinite(finalAmount) ||
      finalAmount <= 0 ||
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100 ||
      !Number.isFinite(cashAmount) ||
      cashAmount < 0
    ) {
      return res.status(400).json({
        message: "Form ki details check karein. Amount, percentage ya mobile galat hai."
      });
    }

    const adjustmentAmount = finalAmount * percentage / 100;
    const actualAmount = finalAmount - adjustmentAmount;

    if (cashAmount > actualAmount) {
      return res.status(400).json({
        message: "Cash Amount, Actual Amount se zyada nahi ho sakta."
      });
    }

    const record = await DebitBuyback.findByIdAndUpdate(
      req.params.id,
      {
        customerName: data.customerName.trim(),
        mobile: String(data.mobile),
        gender: data.gender || "Male",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        voucherType: data.voucherType,
        productName: data.productName.trim(),
        transactionType: data.transactionType || "Fullpayment",
        productAmount,
        finalAmount,
        percentage,
        adjustmentAmount,
        actualAmount,
        cashAmount,
        bankAmount: actualAmount - cashAmount,
        purchaseDate: data.purchaseDate || "",
        purchaseTime: data.purchaseTime || "",
        remarks: data.remarks || ""
      },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        message: "Update karne ke liye saved record nahi mila."
      });
    }

    res.json({
      message: "Purana Debit / Buyback record update ho gaya.",
      record
    });
  } catch (error) {
    console.error("Debit/Buyback Update Error:", error);
    res.status(500).json({
      message: "Debit / Buyback record update nahi hua.",
      error: error.message
    });
  }
});
// DELETE SAVED DEBIT / BUYBACK RECORD
// ===============================
app.delete("/api/debit-buybacks/:id", async (req, res) => {
  try {
    const record = await DebitBuyback.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Debit / Buyback record nahi mila."
      });
    }

    return res.json({
      message: "Debit / Buyback record delete ho gaya."
    });
  } catch (error) {
    console.error("Debit/Buyback Delete Error:", error);
    return res.status(500).json({
      message: "Debit / Buyback record delete nahi hua."
    });
  }
});

// GET SAVED DEBIT / BUYBACK RECORDS
// ===============================
app.get("/api/debit-buybacks", async (req, res) => {
  try {
    const records = await DebitBuyback.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error("Debit/Buyback Load Error:", error);
    res.status(500).json({
      message: "Debit / Buyback records load nahi hue."
    });
  }
});

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




