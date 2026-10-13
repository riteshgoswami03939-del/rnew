const mongoose = require("mongoose");

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

    transactionType: {
      type: String,
      enum: ["Fullpayment", "Booking Emi"],
      required: true,
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

module.exports = mongoose.model("Customer", customerSchema);