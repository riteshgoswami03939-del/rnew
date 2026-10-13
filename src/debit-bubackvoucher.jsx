import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function DebitBuyback() {
  const navigate = useNavigate();

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

  const initialForm = {
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
    percentage: "",
    cashAmount: "",

    purchaseDate: getDate(),
    purchaseTime: getTime(),
    remarks: "",
  };

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  // CITY â†’ STATE
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

  // =========================
  // AMOUNT CALCULATIONS
  // =========================

  const productAmount =
    Number(form.productAmount) || 0;

  const percentage =
    Number(form.percentage) || 0;

  const cashAmount =
    Number(form.cashAmount) || 0;

  // Debit / Buyback amount
  const adjustmentAmount =
    (productAmount * percentage) / 100;

  // Actual amount
  const actualAmount =
    productAmount + adjustmentAmount;

  // Bank amount
  // Actual Amount - Cash Amount
  const bankAmount =
    Math.max(actualAmount - cashAmount, 0);

  const adjustmentLabel =
    form.voucherType === "Debit Voucher"
      ? "Debit"
      : "Buyback";

  // =========================
  // MONEY FORMAT
  // =========================

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // City select karne par State automatic
    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        state: cityStateMap[value] || "",
      }));

      setMessage("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      ...initialForm,
      purchaseDate: getDate(),
      purchaseTime: getTime(),
    });

    setMessage("");
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      setMessage(
        "Mobile number 10 digits ka hona chahiye."
      );
      return;
    }

    if (
      form.pincode &&
      !/^[0-9]{6}$/.test(form.pincode)
    ) {
      setMessage(
        "Pincode 6 digits ka hona chahiye."
      );
      return;
    }

    if (productAmount <= 0) {
      setMessage(
        "Product amount zero se zyada bharein."
      );
      return;
    }

    if (
      form.percentage === "" ||
      percentage < 0 ||
      percentage > 100
    ) {
      setMessage(
        "Percentage 0 se 100 ke beech select karein."
      );
      return;
    }

    if (cashAmount > actualAmount) {
      setMessage(
        "Cash Amount Actual Amount se zyada nahi ho sakta."
      );
      return;
    }

    setMessage(
      `${form.voucherType} details ready hain.`
    );
  };

  return (
    <main className="page">

      {/* =========================
          TOP BAR
      ========================= */}

      <header className="topbar">

        <div className="brand">
          CP
        </div>

        <div>
          <h2>
            Customer Purchase
          </h2>

          <p>
            Debit Management System
          </p>
        </div>

      </header>

      {/* =========================
          PAGE TITLE
      ========================= */}

      <section className="page-title">

        <div>

          <span className="eyebrow">
            DEBIT / BUYBACK
          </span>

          <h1>
            Debit / Buyback Entry
          </h1>

          <p>
            Customer aur debit / buyback details yahan bharein.
          </p>

        </div>

        <div className="today">

          <strong>
            {getDate()}
          </strong>

          <span>
            Today's Date
          </span>

        </div>

      </section>

      {/* =========================
          MAIN FORM
      ========================= */}

      <form
        className="card"
        onSubmit={handleSubmit}
      >

        {/* =========================
            CUSTOMER DETAILS
        ========================= */}

        <div className="section-heading">

          <span className="section-icon">
            01
          </span>

          <div>

            <h3>
              Customer Details
            </h3>

            <p>
              Customer ki basic information
            </p>

          </div>

        </div>

        <div className="grid">

          {/* CUSTOMER NAME */}

          <label className="field span-2">

            Customer Name *

            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Customer ka poora naam"
              required
            />

          </label>

          {/* MOBILE */}

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

          {/* GENDER */}

          <fieldset className="field gender">

            <legend>
              Gender
            </legend>

            <div className="radio-row">

              {[
                "Male",
                "Female",
                "Other",
              ].map((item) => (

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

              ))}

            </div>

          </fieldset>

          {/* CITY */}

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

              <option value="Lucknow">
                Lucknow
              </option>

              <option value="Kanpur">
                Kanpur
              </option>

              <option value="Agra">
                Agra
              </option>

              <option value="Mumbai">
                Mumbai
              </option>

              <option value="Nashik">
                Nashik
              </option>

              <option value="Bangalore">
                Bangalore
              </option>

              <option value="Hyderabad">
                Hyderabad
              </option>

              <option value="Delhi">
                Delhi
              </option>

              <option value="Pune">
                Pune
              </option>

              <option value="Mangalore">
                Mangalore
              </option>

              <option value="Haridwar">
                Haridwar
              </option>

              <option value="Rishikesh">
                Rishikesh
              </option>

              <option value="Noida">
                Noida
              </option>

              <option value="Surat">
                Surat
              </option>

            </select>

          </label>

          {/* STATE */}

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

              <option value="Uttar Pradesh">
                Uttar Pradesh
              </option>

              <option value="Maharashtra">
                Maharashtra
              </option>

              <option value="Karnataka">
                Karnataka
              </option>

              <option value="Telangana">
                Telangana
              </option>

              <option value="Delhi">
                Delhi
              </option>

              <option value="Uttarakhand">
                Uttarakhand
              </option>

              <option value="Gujarat">
                Gujarat
              </option>

            </select>

          </label>

          {/* PINCODE */}

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

        {/* =========================
            DEBIT / BUYBACK DETAILS
        ========================= */}

        <div className="section-heading">

          <span className="section-icon purple">
            02
          </span>

          <div>

            <h3>
              Debit / Buyback Details
            </h3>

            <p>
              Voucher aur amount ki details
            </p>

          </div>

        </div>

        <div className="grid two">

          {/* VOUCHER TYPE */}

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

          {/* PRODUCT NAME */}

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

              <option value="A.C.">
                A.C.
              </option>

              <option value="Coolar">
                Coolar
              </option>

              <option value="Mobile">
                Mobile
              </option>

              <option value="Laptop">
                Laptop
              </option>

              <option value="R.O.">
                R.O.
              </option>

              <option value="Desktop">
                Desktop
              </option>

              <option value="Freeje">
                Freeje
              </option>

              <option value="Water Coolar">
                Water Coolar
              </option>

              <option value="Washing Machine">
                Washing Machine
              </option>

            </select>

          </label>

          {/* TRANSACTION TYPE */}

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

          {/* PRODUCT AMOUNT */}

          <label className="field">

            Product Amount (â‚¹) *

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

          {/* PERCENTAGE */}

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
                (_, index) => index
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

        {/* =========================
            CALCULATIONS
        ========================= */}

        <div className="calculations">

          {/* DEBIT / BUYBACK */}

          <div className="calc debit">

            <span>
              {adjustmentLabel} Amount
            </span>

            <strong>
              {money(adjustmentAmount)}
            </strong>

            <small>
              {percentage}% of product amount
            </small>

          </div>

          {/* ACTUAL AMOUNT */}

          <div className="calc final">

            <span>
              Actual Amount
            </span>

            <strong>
              {money(actualAmount)}
            </strong>

            <small>
              Product amount + {adjustmentLabel.toLowerCase()} amount
            </small>

          </div>

        </div>

        {/* =========================
            CASH + BANK
        ========================= */}

        <div className="grid two">

          {/* CASH AMOUNT */}

          <label className="field">

            Cash Amount (â‚¹)

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

          {/* BANK AMOUNT */}

          <label className="field">

            Bank Amount (â‚¹)

            <input
              type="text"
              value={money(bankAmount)}
              readOnly
            />

          </label>

        </div>

        {/* BANK CALCULATION CARD */}

        <div className="calculations">

          <div className="calc">

            <span>
              Cash Amount
            </span>

            <strong>
              {money(cashAmount)}
            </strong>

            <small>
              Manual cash amount
            </small>

          </div>

          <div className="calc final">

            <span>
              Bank Amount
            </span>

            <strong>
              {money(bankAmount)}
            </strong>

            <small>
              Actual Amount âˆ’ Cash Amount
            </small>

          </div>

        </div>

        <p className="formula">

          {adjustmentLabel} Amount = Product Amount Ã— Percentage Ã· 100.
          <br />

          Actual Amount = Product Amount + {adjustmentLabel} Amount.
          <br />

          Bank Amount = Actual Amount âˆ’ Cash Amount.

        </p>

        <div className="divider" />

        {/* =========================
            DATE / TIME / REMARKS
        ========================= */}

        <div className="section-heading">

          <span className="section-icon orange">
            03
          </span>

          <div>

            <h3>
              Date, Time & Remarks
            </h3>

            <p>
              Entry ki date, time aur additional note
            </p>

          </div>

        </div>

        <div className="grid two">

          {/* DATE */}

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

          {/* TIME */}

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

          {/* REMARKS */}

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

        {/* =========================
            MESSAGE
        ========================= */}

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* =========================
            BUTTONS
        ========================= */}

        <div className="actions">

          <button
            type="button"
            className="btn secondary"
            onClick={resetForm}
          >
            Reset Form
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
            + Save Debit / Buyback
          </button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate("/customers")}
          >
            Customer List
          </button>
        </div>

        <p className="note">
          Abhi Debit / Buyback data database mein save nahi hoga.
        </p>

      </form>

      {/* FOOTER */}

      <footer>
        Customer Purchase Management System Â· React.js
      </footer>

    </main>
  );
}

export default DebitBuyback;


