import React, { useState,useEffect } from "react";

export default function AccountsTab({
  accounts,
  loading,
  onAddClick,
  onTabClick,
  onDeleteAccount,
  showAddDialog,
  newAccountId,
  setNewAccountId,
  newAccountDescription,
  setNewAccountDescription,
  addError,
  onSaveAccount,
  onCancelAdd,
  newAccountCurrency,
  setNewAccountCurrency,
  newAccountGroup,
  setNewAccountGroup,
  newOwner,
  setnewOwner,
  isLoggedIn,
  API_BASE, 
}) {
  // State for update dialog
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateId, setUpdateId] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateCurrency, setUpdateCurrency] = useState("");
  const [updateAccountGroup, setUpdateAccountGroup] = useState("");
  const [updateOwner, setUpdateOwner] = useState("");

  const [updateError, setUpdateError] = useState("");

    // State for owner filter
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");


  // Fetch owners from backend API
  useEffect(() => {
    fetch(`${API_BASE}/api/owners`)
      .then((res) => res.json())
      .then((data) => {
        // If your owner object has a 'name' field, map to names
        setOwners(data.map(owner => owner.description));
      })
      .catch(() => setOwners([]));
  }, []);


  // Open update dialog
  const handleOpenUpdate = (account) => {
    setUpdateId(account.id);
    setUpdateDescription(account.description);
    setUpdateCurrency(account.currency || "");
    setUpdateAccountGroup(account.accountgroup || "");
    setUpdateOwner(account.owner || "");

    setUpdateError("");
    setShowUpdateDialog(true);
  };

  // Save update
  const handleSaveUpdate = () => {
    if (!updateDescription || !updateCurrency || !updateAccountGroup) {
      setUpdateError("Description, Group and currency are required.");
      return;
    }
    fetch(`/api/accounts/${updateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: updateDescription, currency: updateCurrency,
        accountgroup: updateAccountGroup ,owner: updateOwner }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update account");
        return res.json();
      })
      .then(() => {
        setShowUpdateDialog(false);
        setUpdateError("");
        window.location.reload(); // or use a callback prop to refresh accounts
      })
      .catch(() => setUpdateError("Failed to update account."));
  };

  // Cancel update
  const handleCancelUpdate = () => {
    setShowUpdateDialog(false);
    setUpdateError("");
  };

    // Filter accounts by selected owner
  const filteredAccounts = selectedOwner
    ? accounts.filter((acc) => acc.owner === selectedOwner)
    : accounts;


  return (
    <>
      <h1>Accounts</h1>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", gap: "1rem" }}>
        
           <button className="add-btn" onClick={onAddClick}
            disabled={!isLoggedIn}>
            ADD
          </button>
          
        <label>
          Owner:&nbsp;
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            style={{ minWidth: "120px" }}
          >
            <option value="">All</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : filteredAccounts.length === 0 ? (
        <p>No accounts found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              {Object.keys(filteredAccounts[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
              <th>History</th>
              <th>Positions</th>
              <th>Trades</th>
              <th>Orders</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account, idx) => (
              <tr key={idx}>
                {Object.values(account).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => onTabClick("history", account.id)} title="View History">📓</button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => onTabClick("positions", account.id)} title="View Positions">📊</button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => onTabClick("trades", account.id)} disabled={!isLoggedIn} title="View Trades">💹</button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => onTabClick("orders", account.id)} disabled={!isLoggedIn} title="View Orders">🧾</button>  
                </td>

                <td style={{ textAlign: "center" }}>
                  <button disabled={!isLoggedIn}
                    onClick={() => handleOpenUpdate(account)}
                    title="Update Account"
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
                  <button disabled={!isLoggedIn}
                    onClick={() => onDeleteAccount(account.id)}
                    title="Delete Account"
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
          </tbody>
        </table>
      )}

      {/* Add Account Dialog */}
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
            <h2>Add Account</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                ID:
                <input
                  type="text"
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Description:
                <input
                  type="text"
                  value={newAccountDescription}
                  onChange={(e) => setNewAccountDescription(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Currency:
                <input
                  type="text"
                  value={newAccountCurrency}
                  onChange={(e) => setNewAccountCurrency(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
                        <div style={{ marginBottom: "1rem" }}>
              <label>
                Account Group:
                <input
                  type="text"
                  value={newAccountGroup}
                  onChange={(e) => setNewAccountGroup(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
                        <div style={{ marginBottom: "1rem" }}>
              <label>
                Owner:
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setnewOwner(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>

            {addError && (
              <div style={{ color: "red", marginBottom: "1rem" }}>{addError}</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={onCancelAdd}>Cancel</button>
              <button onClick={onSaveAccount}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Account Dialog */}
      {showUpdateDialog && (
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
            <h2>Update Account</h2>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                ID:
                <input
                  type="text"
                  value={updateId}
                  disabled
                  style={{ marginLeft: "1rem", background: "#eee" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Description:
                <input
                  type="text"
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Currency:
                <input
                  type="text"
                  value={updateCurrency}
                  onChange={(e) => setUpdateCurrency(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
                        <div style={{ marginBottom: "1rem" }}>
              <label>
                Account Group:
                <input
                  type="text"
                  value={updateAccountGroup}
                  onChange={(e) => setUpdateAccountGroup(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>
                        <div style={{ marginBottom: "1rem" }}>
              <label>
                Owner:
                <input
                  type="text"
                  value={updateOwner}
                  onChange={(e) => setUpdateOwner(e.target.value)}
                  style={{ marginLeft: "1rem" }}
                />
              </label>
            </div>

            {updateError && (
              <div style={{ color: "red", marginBottom: "1rem" }}>{updateError}</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={handleCancelUpdate}>Cancel</button>
              <button onClick={handleSaveUpdate}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}