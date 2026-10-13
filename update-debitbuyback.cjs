const fs = require("fs");

const file = "src/DebitBuyback.jsx";
let code = fs.readFileSync(file, "utf8");

if (!code.includes('useEffect, useState')) {
  code = code.replace(
    'import { useState } from "react";',
    'import { useEffect, useState } from "react";'
  );
}

if (!code.includes("const [customers, setCustomers]")) {
  code = code.replace(
    '  const navigate = useNavigate();',
    `  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then((response) => {
        if (!response.ok) throw new Error("Customer list load nahi hui.");
        return response.json();
      })
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Customer load error:", error);
        alert("Customer list load nahi hui. Backend check karein.");
      });
  }, []);`
  );
}

if (!code.includes('if (name === "customerName")')) {
  code = code.replace(
    '    if (name === "city") {',
    `    if (name === "customerName") {
      const selected = customers.find(
        (customer) =>
          String(customer.customerName || "").trim().toLowerCase() ===
          value.trim().toLowerCase()
      );

      if (selected) {
        setForm((prev) => ({
          ...prev,
          customerName: selected.customerName || "",
          mobile: String(selected.mobile || ""),
          gender: selected.gender || "Male",
          city: selected.city || "",
          state: selected.state || cityStateMap[selected.city] || "",
          pincode: String(selected.pincode || ""),
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        customerName: value,
      }));
      return;
    }

    if (name === "city") {`
  );
}

if (!code.includes('list="existing-customers"')) {
  code = code.replace(
    `              placeholder="Customer ka poora naam"
              required
            />`,
    `              placeholder="Customer ka naam type/select karein"
              list="existing-customers"
              autoComplete="off"
              required
            />
            <datalist id="existing-customers">
              {customers.map((customer) => (
                <option
                  key={customer._id || customer.mobile}
                  value={customer.customerName || ""}
                >
                  {customer.mobile || ""}
                </option>
              ))}
            </datalist>`
  );
}

if (!code.includes('list="existing-customers"') ||
    !code.includes("const [customers, setCustomers]") ||
    !code.includes('if (name === "customerName")')) {
  console.error("Update poora nahi hua. Backup se file safe hai.");
  process.exit(1);
}

fs.writeFileSync(file, code, "utf8");
console.log("Customer loading update successful.");
