import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import CustomerList from "./CustomerList.jsx";
import DebitBuyback from "./DebitBuyback.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/debit-buyback" element={<DebitBuyback />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);