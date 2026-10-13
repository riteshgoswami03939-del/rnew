import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function DebitBuyback() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [buybackRecords, setBuybackRecords] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const loadBuybackRecords = async () => {
    const response = await fetch("http://localhost:5000/api/debit-buybacks");
    if (!response.ok) throw new Error("Records load nahi hue.");

    const data = await response.json();
    const allRecords = Array.isArray(data) ? data : [];
    const params = new URLSearchParams(window.location.search);
    const requestedMobile = (params.get("mobile") || "").replace(/\D/g, "");

    const matchingRecords = requestedMobile
      ? allRecords.filter(
          (record) =>
            String(record.mobile || "").replace(/\D/g, "") === requestedMobile
        )
      : allRecords;

    setBuybackRecords(matchingRecords);
    return matchingRecords;
  };

  const loadRecordForEdit = (record) => {
    setEditingRecordId(record._id);

    setForm({
      customerName: record.customerName || "",
      mobile: String(record.mobile || ""),
      gender: record.gender || "Male",
      city: record.city || "",
      state: record.state || "",
      pincode: String(record.pincode || ""),
      voucherType: record.voucherType || "Debit Voucher",
      productName: record.productName || "",
      transactionType: record.transactionType || "Fullpayment",
      productAmount: String(record.productAmount ?? ""),
      finalAmount: String(record.finalAmount ?? record.productAmount ?? ""),
      percentage: String(record.percentage ?? ""),
      cashAmount: String(record.cashAmount ?? 0),
      purchaseDate: record.purchaseDate || getDate(),
      purchaseTime: record.purchaseTime || getTime(),
      remarks: record.remarks || ""
    });

    setShowRecords(false);
    setShowCustomerList(false);
  };
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
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("showRecords") === "1") {
      loadBuybackRecords()
        .then((records) => {
          const requestedMobile = (params.get("mobile") || "").replace(/\D/g, "");

          if (!requestedMobile || records.length > 0) {
            setShowRecords(true);
            return;
          }

          setEditingRecordId(null);
          setShowRecords(false);
          setForm((prev) => ({
            ...prev,
            customerName: params.get("customerName") || "",
            mobile: requestedMobile,
            gender: params.get("gender") || "Male",
            city: params.get("city") || "",
            state: params.get("state") || "",
            pincode: params.get("pincode") || "",
            productName: params.get("productName") || "",
            transactionType: params.get("transactionType") || "Fullpayment",
            productAmount: params.get("productAmount") || "",
            finalAmount: params.get("finalAmount") || "",
            percentage: params.get("percentage") || "",
          }));
        })
        .catch((error) => {
          console.error("Debit / Buyback records load error:", error);
          alert("Saved vouchers load nahi hue. Backend check karein.");
        });
    }
  }, []);
  const getDate = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  };

  const getTime = () =>
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    gender: "Male",
    city: "",
    state: "",
    pincode: "",

    voucherType: "Debit Voucher",
    productName: "",
    transactionType: "Fullpayment",
    productAmount: "",
    finalAmount: "",
    percentage: "",
    cashAmount: "",

    purchaseDate: getDate(),
    purchaseTime: getTime(),
    remarks: "",
  });

  const cityStateMap = {
    Lucknow: "Uttar Pradesh",
    Kanpur: "Uttar Pradesh",
    Agra: "Uttar Pradesh",
    Mumbai: "Maharashtra",
    Nashik: "Maharashtra",
    Bangalore: "Karnataka",
    Hyderabad: "Telangana",
    Delhi: "Delhi",
    Pune: "Maharashtra",
    Mangalore: "Karnataka",
    Haridwar: "Uttarakhand",
    Rishikesh: "Uttarakhand",
    Noida: "Uttar Pradesh",
    Surat: "Gujarat",
  };

  const productAmount = Number(form.productAmount) || 0;
  const finalAmount = Number(form.finalAmount) || 0;
  const percentage = Number(form.percentage) || 0;
  const cashAmount = Number(form.cashAmount) || 0;

  const adjustmentAmount =
    (finalAmount * percentage) / 100;

  const actualAmount =
    finalAmount - adjustmentAmount;

  const bankAmount =
    Math.max(actualAmount - cashAmount, 0);

  const adjustmentLabel =
    form.voucherType === "Debit Voucher"
      ? "Debit"
      : "Buyback";

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customerName") {
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
          productName: selected.productName || "",
          productAmount: String(selected.productAmount ?? selected.finalAmount ?? ""),
          finalAmount: String(selected.finalAmount ?? ""),
          purchaseDate: prev.purchaseDate,
          purchaseTime: prev.purchaseTime,
          remarks: selected.remarks || prev.remarks,
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        customerName: value,
      }));
      return;
    }

    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        state: cityStateMap[value] || "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = async (skipDelete = false) => {
    if (editingRecordId && !skipDelete) {
      const confirmed = window.confirm(
        "Kya aap is saved Debit / Buyback record ko permanently delete karna chahte hain?"
      );

      if (!confirmed) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/debit-buybacks/${editingRecordId}`,
          { method: "DELETE" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Record delete nahi hua.");
        }

        alert(result.message);
        await loadBuybackRecords();
      } catch (error) {
        alert(error.message || "Record delete nahi hua. Backend check karein.");
        return;
      }
    }

    setEditingRecordId(null);
    setForm({
      customerName: "",
      mobile: "",
      gender: "Male",
      city: "",
      state: "",
      pincode: "",
      voucherType: "Debit Voucher",
      productName: "",
      transactionType: "Fullpayment",
      productAmount: "",
    finalAmount: "",
      percentage: "",
      cashAmount: "",
      purchaseDate: getDate(),
      purchaseTime: getTime(),
      remarks: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      alert("Mobile number 10 digits ka hona chahiye.");
      return;
    }

    if (form.pincode && !/^[0-9]{6}$/.test(form.pincode)) {
      alert("Pincode 6 digits ka hona chahiye.");
      return;
    }

    if (!form.customerName.trim() || !form.productName.trim()) {
      alert("Customer Name aur Product Name bharein.");
      return;
    }

    if (productAmount <= 0 || finalAmount <= 0) {
      alert("Product Amount aur Final Amount zero se zyada bharein.");
      return;
    }

    if (form.percentage === "" || percentage < 0 || percentage > 100) {
      alert("Percentage 0 se 100 ke beech bharein.");
      return;
    }

    if (cashAmount < 0 || cashAmount > actualAmount) {
      alert("Cash Amount zero se Actual Amount ke beech hona chahiye.");
      return;
    }

    const payload = {
      ...form,
      productAmount,
      finalAmount,
      percentage,
      adjustmentAmount,
      actualAmount,
      cashAmount,
      bankAmount
    };

    try {
      const response = await fetch(
        editingRecordId
          ? `http://localhost:5000/api/debit-buybacks/${editingRecordId}`
          : "http://localhost:5000/api/debit-buybacks",
        {
          method: editingRecordId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Data save nahi hua.");
      }

      alert(
        `${result.message}\nActual Amount: ${money(actualAmount)}\nCash Amount: ${money(cashAmount)}\nBank Amount: ${money(bankAmount)}`
      );

      await resetForm(true);
      await loadBuybackRecords();
      setShowRecords(true);
    } catch (error) {
      console.error("Debit / Buyback Save Error:", error);
      alert(error.message || "Server se connection nahi ho paya.");
    }
  };

  return (
    <main className="page">

      <header className="topbar">
        <div className="brand">CP</div>

        <div>
          <h2>Customer Purchase</h2>
          <p>Debit Management System</p>
        </div>
      </header>

      <section className="page-title">
        <div>
          <span className="eyebrow">
            DEBIT / BUYBACK
          </span>

          <h1>Debit / Buyback Entry</h1>

          <p>
            Customer aur debit / buyback details yahan bharein.
          </p>
        </div>

        <div className="today">
          <strong>{getDate()}</strong>
          <span>Today's Date</span>
        </div>
      </section>

      {showRecords ? (
        <section className="form-section">
          <div className="section-heading">
            <div>
              <h3>Debit / Buyback Records</h3>
              <p>Total records: {buybackRecords.length}</p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setShowRecords(false)}
            >
              Back to Form
            </button>
          </div>

          {buybackRecords.length === 0 ? (
            <p className="note">Abhi koi record nahi hai.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>Voucher</th>
                    <th>Product</th>
                    <th>Product Amount</th>
                    <th>Final Amount</th>
                    <th>Actual Amount</th>
                    <th>Cash Amount</th>
                    <th>Bank Amount</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {buybackRecords.map((record) => (
                    <tr key={record._id}>
                      <td>{record.customerName}</td>
                      <td>{record.mobile}</td>
                      <td>{record.voucherType}</td>
                      <td>{record.productName}</td>
                      <td>{money(Number(record.productAmount) || 0)}</td>
                      <td>{money(Number(record.finalAmount ?? record.productAmount) || 0)}</td>
                      <td>{money(Number(record.actualAmount) || 0)}</td>
                      <td>{money(Number(record.cashAmount) || 0)}</td>
                      <td>{money(Number(record.bankAmount) || 0)}</td>
                      <td>{record.purchaseDate || "-"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => loadRecordForEdit(record)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
      <form
        className="card"
        onSubmit={handleSubmit}
      >

        {/* CUSTOMER DETAILS */}

        <div className="section-heading">
          <span className="section-icon">
            01
          </span>

          <div>
            <h3>Customer Details</h3>
            <p>Customer ki basic information</p>
          </div>
        </div>

        <div className="grid">

          <div className="field span-2">
            <label htmlFor="customerName">Customer Name *</label>

            <input
              id="customerName"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Customer ka naam type karein ya list se select karein"
              list="existing-customers"
              autoComplete="off"
              required
            />

            <datalist id="existing-customers">
              {customers.map((customer) => (
                <option
                  key={customer._id || customer.mobile}
                  value={customer.customerName || ""}
                />
              ))}
            </datalist>

            <button
              type="button"
              className="btn secondary"
              style={{ marginTop: "8px" }}
              onClick={() => setShowCustomerList((prev) => !prev)}
            >
              {showCustomerList ? "Customer List Band Karein" : "Select Customer — Customer List Kholein"}
            </button>

            {showCustomerList && (
              <div style={{ marginTop: "12px", maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
                {customers.length === 0 ? (
                  <p style={{ padding: "12px" }}>Koi customer nahi mila.</p>
                ) : (
                  customers.map((customer) => (
                    <button
                      key={customer._id || customer.mobile}
                      type="button"
                      onClick={() => {
                        handleChange({
                          target: {
                            name: "customerName",
                            value: customer.customerName || ""
                          }
                        });
                        setShowCustomerList(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        borderBottom: "1px solid #eee",
                        background: "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <strong>{customer.customerName || "Naam nahi hai"}</strong>
                      <div>Mobile: {customer.mobile || "—"} | City: {customer.city || "—"}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <label className="field">
            Mobile Number *

            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="10 digit mobile number"
              inputMode="numeric"
              maxLength={10}
              required
            />
          </label>

          <fieldset className="field gender">
            <legend>Gender</legend>

            <div className="radio-row">
              {["Male", "Female", "Other"].map(
                (item) => (
                  <label key={item}>
                    <input
                      type="radio"
                      name="gender"
                      value={item}
                      checked={
                        form.gender === item
                      }
                      onChange={handleChange}
                    />
                    {item}
                  </label>
                )
              )}
            </div>
          </fieldset>

          <label className="field">
            City

            <select
              name="city"
              value={form.city}
              onChange={handleChange}
            >
              <option value="">
                Select City
              </option>

              {Object.keys(cityStateMap).map(
                (city) => (
                  <option
                    key={city}
                    value={city}
                  >
                    {city}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="field">
            State

            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={!form.city}
            >
              <option value="">
                Select State
              </option>

              {[
                "Uttar Pradesh",
                "Maharashtra",
                "Karnataka",
                "Telangana",
                "Delhi",
                "Uttarakhand",
                "Gujarat",
              ].map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Pincode

            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="6 digit pincode"
              inputMode="numeric"
              maxLength={6}
            />
          </label>

        </div>

        <div className="divider" />

        {/* DEBIT / BUYBACK DETAILS */}

        <div className="section-heading">
          <span className="section-icon purple">
            02
          </span>

          <div>
            <h3>Debit / Buyback Details</h3>
            <p>Voucher aur amount ki details</p>
          </div>
        </div>

        <div className="grid two">

          <label className="field">
            Voucher Type *

            <select
              name="voucherType"
              value={form.voucherType}
              onChange={handleChange}
              required
            >
              <option value="Debit Voucher">
                Debit Voucher
              </option>

              <option value="Buyback Voucher">
                Buyback Voucher
              </option>
            </select>
          </label>

          <label className="field">
            Product Name *

            <select
              name="productName"
              value={form.productName}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Product
              </option>

              {[
                "A.C.",
                "Coolar",
                "Mobile",
                "Laptop",
                "R.O.",
                "Desktop",
                "Freeje",
                "Water Coolar",
                "Washing Machine",
              ].map((product) => (
                <option
                  key={product}
                  value={product}
                >
                  {product}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Transaction Type *

            <select
              name="transactionType"
              value={form.transactionType}
              onChange={handleChange}
              required
            >
              <option value="Fullpayment">
                Fullpayment
              </option>

              <option value="Booking Emi">
                Booking Emi
              </option>
            </select>
          </label>

          <label className="field">
            Product Amount *

            <input
              type="number"
              name="productAmount"
              value={form.productAmount}
              onChange={handleChange}
              placeholder="60000"
              min="0.01"
              step="0.01"
              required
            />
          </label>

          <label className="field">
            Final Amount *

            <input
              type="number"
              name="finalAmount"
              value={form.finalAmount}
              onChange={handleChange}
              placeholder="50000"
              min="0.01"
              step="0.01"
              required
            />
          </label>

          <label className="field">
            {adjustmentLabel} Percentage (%) *

            <select
              name="percentage"
              value={form.percentage}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Percentage
              </option>

              {Array.from(
                { length: 101 },
                (_, i) => i
              ).map((percent) => (
                <option
                  key={percent}
                  value={percent}
                >
                  {percent}%
                </option>
              ))}
            </select>
          </label>

        </div>

        {/* CALCULATIONS */}

        <div className="calculations">

          <div className="calc debit">
            <span>
              {adjustmentLabel} Amount
            </span>

            <strong>
              {money(adjustmentAmount)}
            </strong>

            <small>
              {percentage}% of Final Amount
            </small>
          </div>

          <div className="calc final">
            <span>
              Actual Amount
            </span>

            <strong>
              {money(actualAmount)}
            </strong>

            <small>
              Final Amount - {adjustmentLabel} Amount
            </small>
          </div>

        </div>

        {/* CASH + BANK */}

        <div className="grid two">

          <label className="field">
            Cash Amount (?)

            <input
              type="number"
              name="cashAmount"
              value={form.cashAmount}
              onChange={handleChange}
              placeholder="Enter cash amount"
              min="0"
              max={actualAmount}
              step="0.01"
            />
          </label>

          <label className="field">
            Bank Amount (?)

            <input
              type="text"
              value={money(bankAmount)}
              readOnly
            />
          </label>

        </div>

        <div className="calculations">

          <div className="calc">
            <span>Cash Amount</span>

            <strong>
              {money(cashAmount)}
            </strong>

            <small>
              Manual cash amount
            </small>
          </div>

          <div className="calc final">
            <span>Bank Amount</span>

            <strong>
              {money(bankAmount)}
            </strong>

            <small>
              Actual Amount - Cash Amount
            </small>
          </div>

        </div>

        <p className="formula">
          {adjustmentLabel} Amount = Final Amount × Percentage ÷ 100.
          <br />
          Actual Amount = Final Amount - {adjustmentLabel} Amount.
          <br />
          Bank Amount = Actual Amount - Cash Amount.
        </p>

        <div className="divider" />

        {/* DATE / TIME / REMARKS */}

        <div className="section-heading">
          <span className="section-icon orange">
            03
          </span>

          <div>
            <h3>Date, Time & Remarks</h3>
            <p>Entry ki date, time aur additional note</p>
          </div>
        </div>

        <div className="grid two">

          <label className="field">
            Purchase Date

            <input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            Purchase Time

            <input
              type="time"
              name="purchaseTime"
              value={form.purchaseTime}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field span-2">
            Remarks

            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Additional details likhein..."
            />
          </label>

        </div>

        <div className="actions">

          <button
            type="button"
            className="btn secondary"
            onClick={resetForm}
          >
            Clear Form
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate("/")}
          >
            Back to Customer Purchase
          </button>

          <button
            type="submit"
            className="btn primary"
          >
            {editingRecordId ? "Update Debit / Buyback" : "+ Save Debit / Buyback"}
          </button>

        </div>

        <p className="note">
          Debit / Buyback data database mein save hoga.
        </p>

      </form>
      )}

      <footer>
        Customer Purchase Management System · React.js
      </footer>

    </main>
  );
}

export default DebitBuyback;





















