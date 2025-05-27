import React, { useState } from "react";

// Helper to group positions by date
const groupByDate = (data) => {
  const grouped = {};
  data.forEach((item) => {
    const date = item.date || "Unknown Date";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });
  return grouped;
};

export default function PositionsTab({ positions, loading, selectedAccountId }) {
  const grouped = groupByDate(positions);

  // State for add position dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newDate, setNewDate] = useState("");
  const [addError, setAddError] = useState("");

    // Add 'value' field to each position (avgprice * quantity)
  const positionsWithValue = positions.map((pos) => ({
    ...pos,
    value:
      Number(pos.avgprice ?? pos.price ?? 0) *
      Number(pos.quantity ?? pos.qty ?? 0),
  }));


  const handleOpenAdd = () => {
    setNewQty("");
    setNewPrice("");
    setNewCurrency("");
    setNewSymbol("");
    setNewDate("");
    setAddError("");
    setShowAddDialog(true);
  };

  const handleSaveAdd = () => {
    if (!newQty || !newPrice || !newCurrency || !newSymbol || !newDate) {
      setAddError("All fields are required.");
      return;
    }
    fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: selectedAccountId,
        qty: newQty,
        price: newPrice,
        currency: newCurrency,
        symbol: newSymbol,
        date: newDate,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add position");
        return res.json();
      })
      .then(() => {
        setShowAddDialog(false);
        setAddError("");
        // Optionally, refresh positions (ideally via a callback prop)
        window.location.reload();
      })
      .catch(() => setAddError("Failed to add position."));
  };

  const handleCancelAdd = () => {
    setShowAddDialog(false);
    setAddError("");
  };

  // Handler for deleting a position
  const handleDeletePosition = (id) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;
    fetch(`/api/positions/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete position");
        // Optionally, refresh positions (ideally via a callback prop)
        window.location.reload();
      })
      .catch(() => alert("Failed to delete position."));
  };

  return (
    <>
      <h1>Positions    {selectedAccountId ? ` ${selectedAccountId}` : ""} </h1>
      <button  className="add-btn" onClick={handleOpenAdd} style={{ marginBottom: "1rem" }}>
        Add Position
      </button>
      {selectedAccountId === null ? (
        <p>Select an account to view its positions.</p>
      ) : loading ? (
        <p>Loading positions...</p>
      ) : positions.length === 0 ? (
        <p>No positions found for this account.</p>
      ) : (
        Object.entries(grouped).map(([date, rows]) => (
          <div key={date} style={{ marginBottom: "2rem" }}>
            <h3>{date}</h3>
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                  <th>Total</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                                        <td>
                      {(
                        Number(row.avgprice ?? row.price ?? 0) *
                        Number(row.quantity ?? row.qty ?? 0)
                      ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
<td style={{ textAlign: "center" }}>
  <button
    // Edit functionality not implemented yet
    onClick={() => alert("Edit functionality not implemented yet.")}
    title="Edit Position"
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "blue",
      fontSize: "1.2em",
    }}
  >
    ✏️
  </button>
</td>
<td style={{ textAlign: "center" }}>
  <button
    onClick={() => handleDeletePosition(row.id)}
    title="Delete Position"
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "red",
      fontSize: "1.2em",
    }}
  >
    🗑️
  </button>
</td>



                  </tr>
                ))}
                  {/* Sum row */}
  <tr>
    {Object.keys(rows[0]).map((_, i) => (
      <td key={i}></td>
    ))}
    <td style={{ fontWeight: "bold" }}>
      {rows
        .reduce(
          (sum, row) =>
            sum +
            Number(row.avgprice ?? row.price ?? 0) *
              Number(row.quantity ?? row.qty ?? 0),
          0
        )
        .toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </td>

  </tr>

              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Add Position Dialog */}
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
            <h2>Add Position</h2>
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
                Currency:
                <input
                  type="text"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
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