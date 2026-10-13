import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../App.css";

function UpdateCustomer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

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
    transactionType: "Fullpayment",
    productName: "",
    productAmount: "",
    percentage: "",
    purchaseDate: getDate(),
    purchaseTime: getTime(),
    remarks: "",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= CITY → STATE ================= */

  const cityStateMap = {
    Lucknow: "Uttar Pradesh",
    Kanpur: "Uttar Pradesh",
    Agra: "Uttar Pradesh",
    Noida: "Uttar Pradesh",
    Mumbai: "Maharashtra",
    Nashik: "Maharashtra",
    Pune: "Maharashtra",
    Bangalore: "Karnataka",
    Mangalore: "Karnataka",
    Hyderabad: "Telangana",
    Delhi: "Delhi",
    Haridwar: "Uttarakhand",
    Rishikesh: "Uttarakhand",
    Surat: "Gujarat",
  };

  /* ================= LOAD CUSTOMER ================= */

  useEffect(() => {
    let cancelled = false;

    const loadCustomer = async () => {
      if (!editId) {
        setMessage(
          "Customer ID nahi mila. Customer List se Update karein."
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(
          "http://172.16.0.70:5000/api/customers"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            "Customer records load nahi hue."
          );
        }

        const customer = data.find(
          (item) => item._id === editId
        );

        if (!customer) {
          throw new Error(
            "Customer record nahi mila."
          );
        }

        if (cancelled) return;

        setForm({
          customerName:
            customer.customerName || "",

          mobile:
            customer.mobile || "",

          gender:
            customer.gender || "Male",

          city:
            customer.city || "",

          state:
            cityStateMap[customer.city] ||
            customer.state ||
            "",

          pincode:
            customer.pincode || "",

          /* TRANSACTION TYPE */
          transactionType:
            customer.transactionType ||
            "Fullpayment",

          productName:
            customer.productName || "",

          productAmount:
            String(
              customer.productAmount ?? ""
            ),

          percentage:
            String(
              customer.percentage ?? ""
            ),

          purchaseDate:
            customer.purchaseDate ||
            getDate(),

          purchaseTime:
            customer.purchaseTime ||
            getTime(),

          remarks:
            customer.remarks || "",
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Load Customer Error:",
            error
          );

          setMessage(
            error.message ||
              "Record load nahi hua."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  /* ================= CALCULATION ================= */

  const amount =
    Number(form.productAmount) || 0;

  const percentage =
    Number(form.percentage) || 0;

  const debit =
    (amount * percentage) / 100;

  const finalAmount =
    amount - debit;

  /* ================= MONEY ================= */

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    /* CITY SELECT → STATE AUTOMATIC */

    if (name === "city") {
      setForm((prev) => ({
        ...prev,
        city: value,
        state:
          cityStateMap[value] || "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= UPDATE ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!editId) {
      setMessage(
        "Customer ID nahi mila."
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
      percentage < 1 ||
      percentage > 100
    ) {
      setMessage(
        "Percentage 1 se 100 ke beech select karein."
      );

      return;
    }

    if (
      !form.transactionType
    ) {
      setMessage(
        "Transaction Type select karein."
      );

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `http://172.16.0.70:5000/api/customers/${editId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,

            productAmount:
              amount,

            percentage:
              percentage,

            debit:
              debit,

            finalAmount:
              finalAmount,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Record update nahi hua."
        );
      }

      navigate("/customers", {
        state: {
          success:
            "Record successfully updated.",
        },
      });
    } catch (error) {
      console.error(
        "Update Error:",
        error
      );

      setMessage(
        error.message ||
          "Server error. Record update nahi hua."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="page">

        <section className="card">

          <div className="empty">
            Customer record load ho raha hai...
          </div>

        </section>

      </main>
    );
  }

  /* ================= FORM ================= */

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
            Update Customer Purchase
          </h1>

          <p>
            Customer ki existing details edit karein.
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


      {/* FORM */}

      <form
        className="card"
        onSubmit={handleSubmit}
      >

        {/* ================= CUSTOMER DETAILS ================= */}

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

              {Object.keys(
                cityStateMap
              ).map((city) => (

                <option
                  key={city}
                  value={city}
                >
                  {city}
                </option>

              ))}

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

              {[
                ...new Set(
                  Object.values(
                    cityStateMap
                  )
                ),
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


        {/* ================= PURCHASE DETAILS ================= */}

        <div className="section-heading">

          <span className="section-icon purple">
            02
          </span>

          <div>

            <h3>
              Purchase Details
            </h3>

            <p>
              Transaction aur purchase details
            </p>

          </div>

        </div>


        <div className="grid two">

          {/* TRANSACTION TYPE */}

          <label className="field">

            Transaction Type *

            <select
              name="transactionType"
              value={
                form.transactionType
              }
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


          {/* PRODUCT AMOUNT */}

          <label className="field">

            Product Amount (₹) *

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


          {/* PERCENTAGE */}

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
                (_, i) => i + 1
              ).map((p) => (

                <option
                  key={p}
                  value={p}
                >
                  {p}%
                </option>

              ))}

            </select>

          </label>

        </div>


        {/* ================= CALCULATIONS ================= */}

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
              Product amount − debit amount
            </small>

          </div>

        </div>


        <p className="formula">
          Debit = Amount × Percentage ÷ 100.
          Final Amount = Amount − Debit.
        </p>


        <div className="divider" />


        {/* ================= DATE TIME REMARKS ================= */}

        <div className="section-heading">

          <span className="section-icon orange">
            03
          </span>

          <div>

            <h3>
              Date, Time &amp; Remarks
            </h3>

            <p>
              Purchase ki date, time aur additional note
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
            onClick={() =>
              navigate("/customers")
            }
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="btn primary"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Record"}
          </button>

        </div>


        <p className="note">
          Updated details MongoDB mein save hongi.
        </p>

      </form>


      {/* FOOTER */}

      <footer>
        Customer Purchase Management System · React.js
      </footer>

    </main>
  );
}

export default UpdateCustomer;
