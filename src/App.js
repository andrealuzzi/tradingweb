import React, { useEffect, useState } from "react";
import AccountsTab from "./components/AccountsTab";
import HistoryTab from "./components/HistoryTab";
import PositionsTab from "./components/PositionsTab";
import TradesTab from "./components/TradesTab";
import AssetsTab from "./components/AssetsTab";
import logo from "./logo.png"; // Make sure logo.png is in src/ or adjust the path

import "./App.css"; // Import your CSS file

function App() {
  const [accounts, setAccounts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("accounts");
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(false);

  const [trades, setTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAccountId, setNewAccountId] = useState("");
  const [newAccountDescription, setNewAccountDescription] = useState("");
  const [newAccountCurrency, setNewAccountCurrency] = useState("");
  const [newAccountGroup, setNewAccountGroup] = useState("");
  const [newOwner, setnewOwner] = useState("");
  const [addError, setAddError] = useState("");

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme" : "";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch accounts
  useEffect(() => {
    if (activeTab === "accounts") {
      setLoading(true);
      fetch("/api/accounts")
        .then((res) => res.json())
        .then((data) => {
          setAccounts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch accounts:", err);
          setLoading(false);
        });
    }
  }, [activeTab]);

  // Fetch assets
  useEffect(() => {
    if (activeTab === "assets") {
      setAssetsLoading(true);
      fetch("/api/assets")
        .then((res) => res.json())
        .then((data) => {
          setAssets(data);
          setAssetsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch assets:", err);
          setAssetsLoading(false);
        });
    }
  }, [activeTab]);

  // Fetch account history
  useEffect(() => {
    if (activeTab === "history" && selectedAccountId !== null) {
      setHistoryLoading(true);
      fetch(`/api/accounthist/${selectedAccountId}`)
        .then((res) => res.json())
        .then((data) => {
          setHistory(data);
          setHistoryLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch account history:", err);
          setHistory([]);
          setHistoryLoading(false);
        });
    }
  }, [activeTab, selectedAccountId]);

  // Fetch positions
  useEffect(() => {
    if (activeTab === "positions" && selectedAccountId !== null) {
      setPositionsLoading(true);
      fetch(`/api/positions/${selectedAccountId}`)
        .then((res) => res.json())
        .then((data) => {
          setPositions(data);
          setPositionsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch positions:", err);
          setPositions([]);
          setPositionsLoading(false);
        });
    }
  }, [activeTab, selectedAccountId]);

  // Fetch trades
  useEffect(() => {
    if (activeTab === "trades" && selectedAccountId !== null) {
      setTradesLoading(true);
      fetch(`/api/trades/${selectedAccountId}`)
        .then((res) => res.json())
        .then((data) => {
          setTrades(data);
          setTradesLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch trades:", err);
          setTrades([]);
          setTradesLoading(false);
        });
    }
  }, [activeTab, selectedAccountId]);

  // Handler for tab clicks from account actions
  const handleTabClick = (tab, accountId) => {
    setSelectedAccountId(accountId);
    setActiveTab(tab);
  };

  // Handler for opening the Add dialog
  const handleAddClick = () => {
    setNewAccountId("");
    setNewAccountDescription("");
    setAddError("");
    setShowAddDialog(true);
  };

  // Handler for saving a new account
  const handleSaveAccount = () => {
    if (!newAccountId || !newAccountDescription || !newAccountCurrency || !newAccountGroup) {
      setAddError("All fields are required.");
      return;
    }
    fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newAccountId, description: newAccountDescription,currency: newAccountCurrency, 
        accountgroup: newAccountGroup, owner: newOwner}),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add account");
        return res.json();
      })
      .then(() => {
        setShowAddDialog(false);
        setAddError("");
        setNewAccountId("");
        setNewAccountDescription("");
        // Refresh accounts list
        setLoading(true);
        fetch("/api/accounts")
          .then((res) => res.json())
          .then((data) => {
            setAccounts(data);
            setLoading(false);
          });
      })
      .catch(() => setAddError("Failed to add account."));
  };

  // Handler for canceling the dialog
  const handleCancelAdd = () => {
    setShowAddDialog(false);
    setAddError("");
  };

  // Handler for deleting an account
  const handleDeleteAccount = (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    fetch(`/api/accounts/${accountId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete account");
        // Refresh accounts list
        setLoading(true);
        fetch("/api/accounts")
          .then((res) => res.json())
          .then((data) => {
            setAccounts(data);
            setLoading(false);
          });
      })
      .catch(() => alert("Failed to delete account."));
  };

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

  return (
    <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
        <img src={logo} alt="Logo" style={{ height: "40px", marginRight: "1rem" }} />
        <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Trading App</span>
      
           <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
</div>
      <div className="top-buttons">
      {/* Tabs */}
      <div style={{ marginBottom: "1rem" }}>
        <button className={`top-button${activeTab === "accounts" ? " active" : ""}`}
          onClick={() => setActiveTab("accounts")}
          style={{
            fontWeight: activeTab === "accounts" ? "bold" : "normal",

          }}
        >
          Accounts
        </button>
        <button className={`top-button${activeTab === "history" ? " active" : ""}`}
          onClick={() => setActiveTab("history")}
          style={{
            fontWeight: activeTab === "history" ? "bold" : "normal",

          }}
          disabled={selectedAccountId === null}
        >
          History
        </button>
        <button className={`top-button${activeTab === "positions" ? " active" : ""}`}
          onClick={() => setActiveTab("positions")}
          style={{
            fontWeight: activeTab === "positions" ? "bold" : "normal",

          }}
          disabled={selectedAccountId === null}
        >
          Positions
        </button>
        <button className={`top-button${activeTab === "trades" ? " active" : ""}`}
          onClick={() => setActiveTab("trades")}
          style={{
            fontWeight: activeTab === "trades" ? "bold" : "normal",
          }}
          disabled={selectedAccountId === null}
        >
          Trades
        </button>
                <button className={`top-button${activeTab === "assets" ? " active" : ""}`}
          onClick={() => setActiveTab("assets")}
          style={{
            fontWeight: activeTab === "assets" ? "bold" : "normal",
            
          }}

        >
          Assets
        </button>
      </div>
    </div>
      {/* Tab Content */}
      {activeTab === "accounts" && (
        <AccountsTab
    accounts={accounts}
    loading={loading}
    onAddClick={handleAddClick}
    onTabClick={handleTabClick}
    onDeleteAccount={handleDeleteAccount}
    showAddDialog={showAddDialog}
    newAccountId={newAccountId}
    setNewAccountId={setNewAccountId}
    newAccountDescription={newAccountDescription}
    setNewAccountDescription={setNewAccountDescription}
    newAccountCurrency={newAccountCurrency}
    setNewAccountCurrency={setNewAccountCurrency}
    newAccountGroup={newAccountGroup}
    setNewAccountGroup={setNewAccountGroup}
    newOwner={newOwner}
    setnewOwner={setnewOwner}

          addError={addError}
          onSaveAccount={handleSaveAccount}
          onCancelAdd={handleCancelAdd}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          history={history}
          loading={historyLoading}
          selectedAccountId={selectedAccountId}
        />
      )}

      {activeTab === "positions" && (
        <PositionsTab
          positions={positions}
          loading={positionsLoading}
          selectedAccountId={selectedAccountId}
          groupByDate={groupByDate}
        />
      )}

      {activeTab === "trades" && (
        <TradesTab
          trades={trades}
          loading={tradesLoading}
          selectedAccountId={selectedAccountId}
        />
      )}
        {activeTab === "assets" && (
        <AssetsTab
          assets={assets}
          loading={assetsLoading}
          selectedAccountId={selectedAccountId}
        />
      )}

    </div>
  );
}

export default App;