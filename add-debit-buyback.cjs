const fs = require("fs");

const file = ".\server.js";
let code = fs.readFileSync(file, "utf8");

if (!code.includes('mongoose.model("DebitBuyback"')) {
  const model = `
// ===============================
// DEBIT / BUYBACK SCHEMA
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
  transactionType: {
    type: String,
    enum: ["Fullpayment", "Booking Emi"],
    default: "Fullpayment"
  },
  productAmount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  adjustmentAmount: { type: Number, default: 0 },
  actualAmount: { type: Number, default: 0 },
  cashAmount: { type: Number, default: 0 },
  bankAmount: { type: Number, default: 0 },
  purchaseDate: { type: String, default: "" },
  purchaseTime: { type: String, default: "" },
  remarks: { type: String, default: "" }
}, { timestamps: true });

const DebitBuyback = mongoose.model("DebitBuyback", debitBuybackSchema);

`;

  code = code.replace(
    "// GET ALL CUSTOMERS",
    model + "// GET ALL CUSTOMERS"
  );
}

if (!code.includes('app.post("/api/debit-buybacks"')) {
  const routes = `
// ===============================
// DEBIT / BUYBACK: GET ALL
// ===============================
app.get("/api/debit-buybacks", async (req, res) => {
  try {
    const records = await DebitBuyback.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error("Debit/Buyback GET Error:", error);
    res.status(500).json({
      message: "Debit / Buyback records load nahi hue.",
      error: error.message
    });
  }
});

// ===============================
// DEBIT / BUYBACK: SAVE
// ===============================
app.post("/api/debit-buybacks", async (req, res) => {
  try {
    const record = await DebitBuyback.create(req.body);
    console.log("Debit/Buyback saved:", record._id);
    res.status(201).json({
      message: "Debit / Buyback successfully save ho gaya.",
      record
    });
  } catch (error) {
    console.error("Debit/Buyback POST Error:", error);
    res.status(400).json({
      message: "Debit / Buyback save nahi hua.",
      error: error.message
    });
  }
});

// ===============================
// DEBIT / BUYBACK: DELETE
// ===============================
app.delete("/api/debit-buybacks/:id", async (req, res) => {
  try {
    const record = await DebitBuyback.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Record nahi mila." });
    }
    res.json({ message: "Debit / Buyback record delete ho gaya." });
  } catch (error) {
    console.error("Debit/Buyback DELETE Error:", error);
    res.status(400).json({
      message: "Record delete nahi hua.",
      error: error.message
    });
  }
});

`;

  code = code.replace(
    "// TEST SERVER",
    routes + "// TEST SERVER"
  );
}

fs.writeFileSync(file, code, "utf8");
console.log("Debit / Buyback backend routes add ho gaye.");
