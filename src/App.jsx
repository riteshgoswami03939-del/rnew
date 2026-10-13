import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./App.css";
import DebitBuyback from "./DebitBuyback";

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

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
  productName: "",
  transactionType: "Fullpayment",
  productAmount: "",
  percentage: "",
  purchaseDate: getDate(),
  purchaseTime: getTime(),
  remarks: "",
};

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);

  // CITY â†’ STATE MAPPING
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

  // UPDATE: Existing customer ka data form mein load karein
  useEffect(() => {
    if (!editId) {
      setForm({
        ...initialForm,
        purchaseDate: getDate(),
        purchaseTime: getTime(),
      });

      setMessage("");
      setLoadingRecord(false);
      return;
    }

    let cancelled = false;

    const loadRecord = async () => {
      try {
        setLoadingRecord(true);
        setMessage("");

        const response = await fetch(
          "http://172.16.0.70:5000/api/customers"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Customer records load nahi hue.");
        }

        const record = data.find(
          (item) => item._id === editId
        );

        if (!record) {
          throw new Error("Selected customer record nahi mila.");
        }

        if (cancelled) return;

        setForm({
          customerName: record.customerName || "",
          mobile: record.mobile || "",
          gender: record.gender || "Male",

          city: record.city || "",

          state:
            cityStateMap[record.city] ||
            record.state ||
            "",

          pincode: record.pincode || "",

          productName: record.productName || "",

          productAmount: String(
            record.productAmount ?? ""
          ),

          percentage: String(
            record.percentage ?? ""
          ),

          purchaseDate:
            record.purchaseDate || getDate(),

          purchaseTime:
            record.purchaseTime || getTime(),

          remarks: record.remarks || "",
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Load Record Error:",
            error
          );

          setMessage(
            error.message ||
              "Record load nahi hua."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRecord(false);
        }
      }
    };

    loadRecord();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const amount =
    Number(form.productAmount) || 0;

  const percentage =
    Number(form.percentage) || 0;

  const debit =
    (amount * percentage) / 100;

  const finalAmount =
    amount - debit;

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  // HANDLE FORM CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    // City select karte hi State automatically set hoga
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

  const resetForm = () => {
    if (isEditMode) {
      navigate("/");
      return;
    }

    setForm({
      ...initialForm,
      purchaseDate: getDate(),
      purchaseTime: getTime(),
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode && loadingRecord) {
      setMessage(
        "Record load hone ka intezar karein."
      );

      return;
    }

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

    if (amount <= 0) {
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
        "Percentage 1 se 100 ke beech select karein."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const record = {
      ...form,
      productAmount: amount,
      percentage,
      debit,
      finalAmount,
    };

    try {
      // Edit mode mein PUT
      // New record ke liye POST
      const response = await fetch(
        isEditMode
          ? `http://172.16.0.70:5000/api/customers/${editId}`
          : "http://172.16.0.70:5000/api/customers",
        {
          method: isEditMode
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(record),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditMode
              ? "Record update nahi hua."
              : "Record save nahi hua.")
        );
      }

      // Success message Customer List par dikhane ke liye
      navigate("/customers", {
        state: {
          success: isEditMode
            ? "Record successfully updated."
            : "Record successfully saved.",
        },
      });
    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          (isEditMode
            ? "Record update nahi hua. Server check karein."
            : "Record save nahi hua. Server check karein.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">

      {/* TOP BAR */}
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

      {/* PAGE TITLE */}
      <section className="page-title">
        <div>
          <span className="eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>
            {isEditMode
              ? "Update Customer Purchase"
              : "Customer Purchase Entry"}
          </h1>

          <p>
            {isEditMode
              ? "Existing customer ki details update karein."
              : "Customer aur purchase details yahan bharein."}
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

      {/* ENTRY / UPDATE FORM */}
      {loadingRecord ? (
        <section className="card">
          <div className="empty">
            Customer record load ho raha hai...
          </div>
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
              <h3>
                Customer Details
              </h3>

              <p>
                Customer ki basic information
              </p>
            </div>
          </div>

          <div className="grid">

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

          {/* PURCHASE DETAILS */}
          <div className="section-heading">

            <span className="section-icon purple">
              02
            </span>

            <div>
              <h3>
                Purchase Details
              </h3>

              <p>
                Amount aur percentage ke hisaab se calculation
              </p>
            </div>

          </div>

          <div className="grid two">

            {/* PRODUCT NAME DROPDOWN */}
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

            <label className="field">
  Transaction Type *

  <select
    name="transactionType"
    value={form.transactionType}
    onChange={handleChange}
    required
  >
    <option value="Fullpayment">Fullpayment</option>
    <option value="Booking Emi">Booking Emi</option>
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
                placeholder="10000"
                min="0.01"
                step="0.01"
                required
              />
            </label>

            {/* PERCENTAGE DROPDOWN */}
            <label className="field">
              Debit Percentage (%) *

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
                  { length: 100 },
                  (_, index) => index + 0
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
                Debit Amount
              </span>

              <strong>
                {money(debit)}
              </strong>

              <small>
                {percentage}% of product amount
              </small>

            </div>

            <div className="calc final">

              <span>
                Final Amount
              </span>

              <strong>
                {money(finalAmount)}
              </strong>

              <small>
                Product amount âˆ’ debit amount
              </small>

            </div>

          </div>

          <p className="formula">
            Debit = Amount Ã— Percentage Ã· 100.
            Final Amount = Amount âˆ’ Debit.
          </p>

          <div className="divider" />

          {/* DATE / TIME / REMARKS */}
          <div className="section-heading">

            <span className="section-icon orange">
              03
            </span>

            <div>

              <h3>
                Date, Time & Remarks
              </h3>

              <p>
                Purchase ki date, time aur additional note
              </p>

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

          {/* MESSAGE */}
          {message && (
            <div className="message">
              {message}
            </div>
          )}

          {/* BUTTONS */}
          <div className="actions">

            <button
              type="button"
              className="btn secondary"
              onClick={resetForm}
              disabled={saving}
            >
              {isEditMode
                ? "Cancel Update"
                : "Reset Form"}
            </button>

            <button
              type="submit"
              className="btn primary"
              disabled={
                saving ||
                loadingRecord
              }
            >
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update Record"
                  : "+ Save Purchase Record"}
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
            Data MongoDB mein permanently save hoga.
          </p>

        </form>
      )}

      <footer>
        Customer Purchase Management System Â· React.js
      </footer>

    </main>
  );
}

export default App;



