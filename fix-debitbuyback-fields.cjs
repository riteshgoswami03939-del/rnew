const fs = require("fs");

const file = "./src/DebitBuyback.jsx";
let code = fs.readFileSync(file, "utf8");

const oldText = `          pincode: String(selected.pincode || ""),
        }));`;

const newText = `          pincode: String(selected.pincode || ""),
          productName: selected.productName || prev.productName,
          transactionType: selected.transactionType || prev.transactionType,
          productAmount:
            selected.productAmount != null
              ? String(selected.productAmount)
              : prev.productAmount,
          percentage:
            selected.percentage != null
              ? String(selected.percentage)
              : prev.percentage,
          purchaseDate: selected.purchaseDate || prev.purchaseDate,
          purchaseTime: selected.purchaseTime || prev.purchaseTime,
          remarks: selected.remarks || prev.remarks,
        }));`;

if (code.includes(newText)) {
  console.log("Transaction fields mapping pehle se maujood hai.");
} else if (code.includes(oldText)) {
  code = code.replace(oldText, newText);
  fs.writeFileSync(file, code, "utf8");
  console.log("Customer aur product details mapping update ho gayi.");
} else {
  console.error("Expected code nahi mila. File change nahi ki.");
  process.exit(1);
}
