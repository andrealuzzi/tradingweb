import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

export default function AssetsTab({ assets, loading, selectedAccountId }) {
  const [localAssets, setLocalAssets] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (!assets) {
      setLocalLoading(true);
      fetch("/api/assets")
        .then((res) => res.json())
        .then((data) => {
          setLocalAssets(data);
          setLocalLoading(false);
        })
        .catch(() => setLocalLoading(false));
    }
  }, [assets]);

  const data = assets || localAssets;
  const isLoading = loading !== undefined ? loading : localLoading;

  const handleDeleteAsset = (symbol) => {
    if (!window.confirm(`Are you sure you want to delete asset "${symbol}"?`)) return;
    fetch(`/api/assets/${symbol}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete asset");
          window.location.reload();
      })
      .catch(() => alert("Failed to delete asset."));
  };
    const handleChartAsset = (symbol) => {

        window.open(`/chart/${symbol}`, '_blank');
        
  };

  const handleOpenAdd = () => {
    setNewSymbol("");
    setNewName("");
    setNewType("");
    setNewValue("");
    setNewCurrency("");
    setAddError("");
    setShowAddDialog(true);
  };

  const handleSaveAdd = () => {
    if (!newSymbol || !newName || !newType  || !newCurrency) {
      setAddError("All fields are required.");
      return;
    }
    fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: newSymbol,
        description: newName,
        type: newType,
        currency: newCurrency,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add asset");
        return res.json();
      })
      .then((asset) => {
        setShowAddDialog(false);
        setAddError("");
        setLocalAssets((prev) => [...prev, asset]);
      })
      .catch(() => setAddError("Failed to add asset."));
  };

  const handleCancelAdd = () => {
    setShowAddDialog(false);
    setAddError("");
  };

    // --- Edit Dialog Logic ---
  const handleOpenEdit = (asset) => {
    setEditAsset(asset);
    setNewSymbol(asset.symbol);
    setNewName(asset.name || asset.description || "");
    setNewType(asset.type || "");
    setNewCurrency(asset.currency || "");
    setEditError("");
    setShowEditDialog(true);
  };
    const handleSaveEdit = () => {
    if (!newSymbol || !newName || !newType || !newValue || !newCurrency) {
      setEditError("All fields are required.");
      return;
    }
    fetch(`/api/assets/${editAsset.symbol}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol: newSymbol,
        name: newName,
        type: newType,
        value: newValue,
        currency: newCurrency,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update asset");
        window.location.reload();
      })
      .catch(() => setEditError("Failed to update asset."));
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditError("");
  };

  return (
    <>
      <div>
        <h1>Assets</h1>
        <button className="add-btn" onClick={handleOpenAdd} style={{ marginBottom: "1rem" }}>
          Add
        </button>
        {isLoading ? (
          <p>Loading assets...</p>
        ) : data.length === 0 ? (
          <p>No assets found.</p>
        ) : (
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
                <th>Edit</th>
                <th>Delete</th>
                <th>Chart</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.map((asset, idx) => (
                <tr key={idx}>
                  {Object.values(asset).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                  <td style={{ textAlign: "center" }}>
                    <button
                          onClick={() => handleOpenEdit(asset)}
                      title="Edit Asset"
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
                      onClick={() => handleDeleteAsset(asset.symbol)}
                      title="Delete Asset"
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
                     <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleChartAsset(asset.symbol)}
                      title="Chart"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "red",
                        fontSize: "1.2em",
                      }}
                    >
                      📈
                    </button>
                  </td>
                  <td>
  <button
    onClick={() => window.open(`https://www.roic.ai/quote/${asset.symbol}`, '_blank')}
    title="Details"
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "purple",
      fontSize: "1.2em",
    }}
  >
    🌐
  </button>
                    </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddDialog && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <h2>Add Asset</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveAdd();
              }}
            >
              <label>
                Symbol:
                <input
                  type="text"
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value)}
                  autoFocus
                  required
                />
              </label>
              <label>
                Name:
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  required
                />
              </label>
              <label>
                Currency:
                <input
                  type="text"
                  value={newCurrency}
                  onChange={e => setNewCurrency(e.target.value)}
                  required
                />
              </label>
              {addError && (
                <div className="error-message">{addError}</div>
              )}
              <div className="dialog-actions">
                <button type="button" onClick={handleCancelAdd}>
                  Cancel
                </button>
                <button type="submit" className="add-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showEditDialog && (
        <div className="dialog-backdrop">
          <div className="dialog-box">
            <h2>Edit Asset</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveEdit();
              }}
            >
              <label>
                Symbol:
                <input
                  type="text"
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value)}
                  required
                  disabled
                />
              </label>
              <label>
                Name:
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  required
                />
              </label>
              <label>
                Currency:
                <input
                  type="text"
                  value={newCurrency}
                  onChange={e => setNewCurrency(e.target.value)}
                  required
                />
              </label>
              {editError && (
                <div className="error-message">{editError}</div>
              )}
              <div className="dialog-actions">
                <button type="button" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="add-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}