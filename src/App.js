import React, { useEffect, useState,useCallback } from "react";
import AccountsTab from "./components/AccountsTab";
import HistoryTab from "./components/HistoryTab";
import PositionsTab from "./components/PositionsTab";
import TradesTab from "./components/TradesTab";
import OrdersTab from "./components/OrdersTab";
import AssetsTab from "./components/AssetsTab";
import ChartsTab from "./components/ChartsTab";
import logo from "./logo.png"; // Make sure logo.png is in src/ or adjust the path
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);


  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAccountId, setNewAccountId] = useState("");
  const [newAccountDescription, setNewAccountDescription] = useState("");
  const [newAccountCurrency, setNewAccountCurrency] = useState("");
  const [newAccountGroup, setNewAccountGroup] = useState("");
  const [newOwner, setnewOwner] = useState("");
  const [addError, setAddError] = useState("");

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginResult, setLoginResult] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //const API_BASE = "https://tradingapp-egfgajhsc2f5ggfw.canadacentral-01.azurewebsites.net";
   const API_BASE = "http://127.0.0.1:5000"; // For local development
  
  // Login handler
  const handleLogin = () => {
    setLoginError("");
    fetch(`${API_BASE}/api/users/check_credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUser, password: loginPwd }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result === 1) {
          setShowLogin(false);
          setLoginResult("Login successful!");
          setIsLoggedIn(true); // <-- Set logged in!
        } else {
          setLoginError("Invalid credentials.");
          setIsLoggedIn(false);
        }
      })
      .catch(() => setLoginError("Login failed."));
  };
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
      fetch(`${API_BASE}/api/accounts`)
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
      fetch(`${API_BASE}/api/assets`)
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
      fetch(`${API_BASE}/api/accounthist/${selectedAccountId}`)
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


  // Fetch positions with auto-refresh every 30 seconds
useEffect(() => {
  let interval;

  const fetchPositions = () => {
    setPositionsLoading(true);
    fetch(`${API_BASE}/api/positions/${selectedAccountId}`)
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
  };

  const fetchHistory = () => {
    setHistoryLoading(true);
    fetch(`${API_BASE}/api/accounthist/${selectedAccountId}`)
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
  };

  if (selectedAccountId !== null) {
    if (activeTab === "positions") {
      fetchPositions();
      interval = setInterval(fetchPositions, 120000); // 2 minutes
    } else if (activeTab === "history") {
      fetchHistory();
      interval = setInterval(fetchHistory, 120000); // 2 minutes
    }
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [activeTab, selectedAccountId]);

  // Fetch trades
  useEffect(() => {
    if (activeTab === "trades" && selectedAccountId !== null) {
      setTradesLoading(true);
      fetch(`${API_BASE}/api/trades/${selectedAccountId}`)
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
  // Fetch orders
  useEffect(() => {
    if (activeTab === "orders" && selectedAccountId !== null) {
      setOrdersLoading(true);
      fetch(`${API_BASE}/api/orders/${selectedAccountId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setOrdersLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch orders:", err);
          setOrders([]);
          setOrdersLoading(false);
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
    fetch(`${API_BASE}/api/accounts`, {
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

    // Add a refresh handler
  const handleRefresh = useCallback(() => {
  if (activeTab === "accounts") {
    setLoading(true);
    fetch(`${API_BASE}/api/accounts`)
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoading(false);
      });
  } else if (activeTab === "assets") {
    setAssetsLoading(true);
    fetch(`${API_BASE}/api/assets`)
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setAssetsLoading(false);
      });
  } else if (activeTab === "history" && selectedAccountId !== null) {
    setHistoryLoading(true);
    fetch(`${API_BASE}/api/accounthist/${selectedAccountId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setHistoryLoading(false);
      });
  } else if (activeTab === "positions" && selectedAccountId !== null) {
    setPositionsLoading(true);
    fetch(`${API_BASE}/api/positions/${selectedAccountId}`)
      .then((res) => res.json())
      .then((data) => {
        setPositions(data);
        setPositionsLoading(false);
      });
  } else if (activeTab === "trades" && selectedAccountId !== null) {
    setTradesLoading(true);
    fetch(`${API_BASE}/api/trades/${selectedAccountId}`)
      .then((res) => res.json())
      .then((data) => {
        setTrades(data);
        setTradesLoading(false);
      });
  }
  else if (activeTab === "orders" && selectedAccountId !== null) {
    setOrdersLoading(true);
    fetch(`${API_BASE}/api/orders/${selectedAccountId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
  }
}, [activeTab, selectedAccountId]);


  // Handler for deleting an account
  const handleDeleteAccount = (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    fetch(`${API_BASE}/api/accounts/${accountId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete account");
        // Refresh accounts list
        setLoading(true);
        fetch(`${API_BASE}/api/accounts`)
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

    const mainLayout = (

    <div style={{ padding: "2rem" }}>
<div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <img src={logo} alt="Logo" style={{ height: "40px", marginBottom: "0.5rem" }} />
    <button
        className="add-btn"
  onClick={() => {
    if (isLoggedIn) {
      setIsLoggedIn(false); // Log out
      setLoginUser("");
      setLoginPwd("");
      setLoginResult(null);
    } else {
      setShowLogin(true); // Show login form
    }
  }}
>
  {isLoggedIn ? "Log out" : "Login"}
  </button>
  </div>

           <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
                <button
          onClick={handleRefresh}
          className="theme-toggle-btn"
          title="Refresh"
          style={{ marginLeft: "0.5rem", fontSize: "1.7rem" }}
        >
          🌀
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
          disabled={!isLoggedIn || selectedAccountId === null} // <-- Only enabled if logged in
        >
          Trades
        </button>
          <button className={`top-button${activeTab === "orders" ? " active" : ""}`}
          onClick={() => setActiveTab("orders")}
          style={{
            fontWeight: activeTab === "orders" ? "bold" : "normal",
          }}
          disabled={!isLoggedIn || selectedAccountId === null} // <-- Only enabled if logged in
        >
          Orders
        </button>
                <button className={`top-button${activeTab === "assets" ? " active" : ""}`}
          onClick={() => setActiveTab("assets")}
          style={{
            fontWeight: activeTab === "assets" ? "bold" : "normal",
            
          }}
          disabled={!isLoggedIn || selectedAccountId === null} // <-- Only enabled if logged in

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
          isLoggedIn={isLoggedIn} 
          API_BASE={API_BASE} 
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
          isLoggedIn={isLoggedIn} 
        />
      )}

      {activeTab === "trades" && (
        <TradesTab
          trades={trades}
          loading={tradesLoading}
          selectedAccountId={selectedAccountId}

        />
      )}

      {activeTab === "orders" && (
        <OrdersTab
          orders={orders}
          loading={ordersLoading}
          selectedAccountId={selectedAccountId}
        />
      )}

        {activeTab === "assets" && (
        <AssetsTab
          assets={assets}
          loading={assetsLoading}
          selectedAccountId={selectedAccountId}
            API_BASE={API_BASE} 
        />
      )}

       </div>
  );


  // Login page
  const loginPage = (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    background: theme === "dark" ? "#222" : "#f8fafc",
    color: theme === "dark" ? "#f8fafc" : "#222",
    transition: "background 0.3s, color 0.3s"
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: "300px"
      }}>
        <h2>Login</h2>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            User:
            <input
              type="text"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              style={{ marginLeft: "1rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Password:
            <input
              type="password"
              value={loginPwd}
              onChange={e => setLoginPwd(e.target.value)}
              style={{ marginLeft: "1rem" }}
            />
          </label>
        </div>
        {loginError && <div style={{ color: "red", marginBottom: "1rem" }}>{loginError}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button onClick={() => setShowLogin(false)}>Cancel</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
if (showLogin) {
  return loginPage;
}
function MainLayout() {
  return mainLayout;
}
    return (
   <Router>
  <Routes>
    <Route path="/" element={<MainLayout />} />
     <Route path="/chart/:symbol" element={<ChartsTab API_BASE={API_BASE} accounts={accounts}  />} />
    <Route path="*" element={<MainLayout />}/>
  </Routes>
</Router>
  );
}

export default App;