import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function CustomerList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isListHidden, setIsListHidden] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://172.16.0.70:5000/api/customers"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Records load nahi hue.");
      }

      setRecords(data);
    } catch (error) {
      console.error("Fetch Error:", error);

      setMessage(
        "Customer records load nahi hue. Server check karein."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Kya aap ye record delete karna chahte hain?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://172.16.0.70:5000/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Delete nahi hua."
        );
      }

      setRecords((previousRecords) =>
        previousRecords.filter(
          (record) => record._id !== id
        )
      );

      setMessage(
        "Record successfully delete ho gaya."
      );
    } catch (error) {
      console.error("Delete Error:", error);

      setMessage(
        "Record delete nahi hua."
      );
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/?edit=${encodeURIComponent(
      id
    )}`;
  };

  // =========================
  // DEBIT / BUYBACK
  // =========================

  const handleDebitBuyback = (record) => {
    const params = new URLSearchParams({
      customerName: record.customerName || "",
      mobile: record.mobile || "",
      gender: record.gender || "Male",
      city: record.city || "",
      state: record.state || "",
      pincode: record.pincode || "",

      productName: record.productName || "",
      transactionType:
        record.transactionType || "Fullpayment",

      productAmount: String(record.productAmount ?? record.finalAmount ?? ""),
      finalAmount: String(record.finalAmount ?? record.productAmount ?? ""),

      percentage:
        record.percentage !== undefined
          ? String(record.percentage)
          : "",
      showRecords: "1",
    });

    window.location.href =
      `/debit-buyback?${params.toString()}`;
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
            Customer Records
          </h1>

          <p>
            Saved customer purchase records yahan dekhein.
          </p>

        </div>

        <Link
          to="/"
          className="btn primary"
        >
          + New Purchase
        </Link>

      </section>

      {/* CUSTOMER RECORDS */}

      <section className="card records">

        <div className="section-heading">

          <span className="section-icon">
            04
          </span>

          <div>

            <h3>
              Customer Records
            </h3>

            <p>
              Total records: {records.length}
            </p>
            <button
              type="button"
              className={`list-visibility-btn ${isListHidden ? "is-hidden" : "is-visible"}`}
              onClick={() => setIsListHidden((hidden) => !hidden)}
              aria-expanded={!isListHidden}
            >
              {isListHidden ? "👁 Show List" : "🔒 Hide List"}
            </button>

          </div>

        </div>

{!isListHidden && (
          <>
                {/* MESSAGE */}

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* LOADING */}

        {loading ? (

          <div className="empty">
            Customer records load ho rahe hain...
          </div>

        ) : records.length === 0 ? (

          <div className="empty">
            Abhi koi record nahi hai.
            <br />
            Pehle Customer Purchase Entry form
            bharkar Save karein.
          </div>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Product Name
                  </th>

                  <th>
                    Transaction Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Debit %
                  </th>

                  <th>
                    Debit
                  </th>

                  <th>
                    Final Amount
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Time
                  </th>

                  <th>
                    Remarks
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map((record) => (

                  <tr key={record._id}>

                    {/* CUSTOMER */}

                    <td>
                      {record.customerName}
                    </td>

                    {/* MOBILE */}

                    <td>
                      {record.mobile}
                    </td>
                    
                    {/* GENDER */}

                    <td>
                      {record.gender}
                    </td>

                    {/* PRODUCT */}

                    <td>
                      {record.productName}
                    </td>

                    {/* TRANSACTION TYPE */}

                    <td>
                      {record.transactionType || "-"}
                    </td>

                    {/* PRODUCT AMOUNT */}

                    <td>
                      {money(record.productAmount)}
                    </td>

                    {/* PERCENTAGE */}

                    <td>
                      {record.percentage}%
                    </td>

                    {/* DEBIT */}

                    <td>
                      {money(record.debit)}
                    </td>

                    {/* FINAL AMOUNT */}

                    <td>
                      {money(record.finalAmount)}
                    </td>

                    {/* DATE */}

                    <td>
                      {record.purchaseDate || "-"}
                    </td>

                    {/* TIME */}

                    <td>
                      {record.purchaseTime || "-"}
                    </td>

                    {/* REMARKS */}

                    <td>
                      {record.remarks || "-"}
                    </td>

                    {/* ACTION */}

                    <td>

                      <div className="record-actions">
  <button
    type="button"
    className="actions-toggle"
    aria-expanded={openActionId === record._id}
    onClick={() =>
      setOpenActionId((currentId) =>
        currentId === record._id ? null : record._id
      )
    }
  >
    {openActionId === record._id ? "Actions ▲" : "Actions ▼"}
  </button>

  {openActionId === record._id && (
    <div className="record-action-menu">
      <button
        type="button"
        className="update-btn"
        onClick={() => handleUpdate(record._id)}
      >
        Update
      </button>

      <button
        type="button"
        className="debit-buyback-btn"
        onClick={() => handleDebitBuyback(record)}
      >
        Debit / Buyback
      </button>

      <button
        type="button"
        className="delete"
        onClick={() => handleDelete(record._id)}
      >
        Delete
      </button>
    </div>
  )}
</div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      
        </> )}
      </section>

      {/* FOOTER */}

      <footer>
        Customer Purchase Management System Ã‚Â· React.js
      </footer>

    </main>
  );
}

export default CustomerList;




