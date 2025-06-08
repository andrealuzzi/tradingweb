import React, { useState } from "react";

export default function TradesTab({ trades, loading, selectedAccountId }) {

  // State for add position dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newDate, setNewDate] = useState("");
  const [addError, setAddError] = useState("");

  // Filter and sort state
  const [filters, setFilters] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleOpenAdd = () => {
    setNewQty("");
    setNewPrice("");
    setNewStatus("");
    setNewSymbol("");
    setNewAction("");
    setNewDate("");
    setAddError("");
    setShowAddDialog(true);
  };
  const handleSaveAdd = () => {
    if (!newQty || !newPrice  || !newSymbol || !newDate) {
      setAddError("All fields are required.");
      return;
    }
    fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account: selectedAccountId,
        quantity: newQty,
        price: newPrice,
        status: newStatus,
        symbol: newSymbol,
        action: newAction,
        date: newDate,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add trade");
        return res.json();
      })
      .then(() => {
        setShowAddDialog(false);
        setAddError("");
        // Optionally, refresh trades (ideally via a callback prop)
        window.location.reload();
      })
      .catch(() => setAddError("Failed to add trade."));
  };

  const handleCancelAdd = () => {
    setShowAddDialog(false);
    setAddError("");
  };

  // Filtering and sorting logic
  let filteredTrades = trades;
  if (trades.length > 0) {
    filteredTrades = trades.filter((row) =>
      Object.entries(filters).every(
        ([key, value]) =>
          value === "" ||
          (row[key] !== null &&
            row[key] !== undefined &&
            row[key].toString().toLowerCase().includes(value.toLowerCase()))
      )
    );
    if (sortKey) {
      filteredTrades = [...filteredTrades].sort((a, b) => {
        if (a[sortKey] === b[sortKey]) return 0;
        if (a[sortKey] === null || a[sortKey] === undefined) return 1;
        if (b[sortKey] === null || b[sortKey] === undefined) return -1;
        if (typeof a[sortKey] === "number" && typeof b[sortKey] === "number") {
          return sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
        }
        return sortAsc
          ? a[sortKey].toString().localeCompare(b[sortKey].toString())
          : b[sortKey].toString().localeCompare(a[sortKey].toString());
      });
    }
  }




  return (
    <>
      <h1>Trades    {selectedAccountId ? ` ${selectedAccountId}` : ""} </h1>
        <button  className="add-btn" onClick={handleOpenAdd} style={{ marginBottom: "1rem" }}>
        Add Trade
      </button>
      {selectedAccountId === null ? (
        <p>Select an account to view its trades.</p>
      ) : loading ? (
        <p>Loading trades...</p>
      ) : trades.length === 0 ? (
        <p>No trades found for this account.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              {Object.keys(trades[0]).map((key) => (
                <th key={key} style={{ position: "relative" }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (sortKey === key) setSortAsc((asc) => !asc);
                      else {
                        setSortKey(key);
                        setSortAsc(true);
                      }
                    }}
                  >
                    {key}
                    {sortKey === key ? (sortAsc ? " ▲" : " ▼") : ""}
                  </span>
                  <br />
                  <input
                    style={{ width: "90%" }}
                    type="text"
                    placeholder="Filter"
                    value={filters[key] || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredTrades.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
            {/* Add Trades Dialog */}
      {showAddDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              minWidth: "300px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h2>Add Trade</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Qty:
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Price:
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Symbol:
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Status:
                <input
                  type="text"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Action:
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Date:
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            {addError && (
              <div style={{ color: "red", marginBottom: "1rem" }}>{addError}</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={handleCancelAdd}>Cancel</button>
              <button onClick={handleSaveAdd}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}