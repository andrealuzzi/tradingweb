import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale
);

function ChartsTab({ API_BASE,accounts=[] }) {
  const { symbol: urlSymbol } = useParams();
  const [prices, setPrices] = useState([]);
  const [trades, setTrades] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(urlSymbol || "");

  const [loading, setLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [tradesError, setTradesError] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

    // Fetch symbols from /api/assets
  useEffect(() => {
    fetch(`${API_BASE}/api/assets`)
      .then(res => res.json())
      .then(data => {
        const syms = Array.isArray(data)
          ? data.map(a => a.symbol || a)
          : [];
        setSymbols(syms);
        // If no symbol selected, pick the first one
        if (!selectedSymbol && syms.length > 0) setSelectedSymbol(syms[0]);
      });
    // eslint-disable-next-line
  }, [API_BASE]);

  // Update URL when symbol changes
  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== urlSymbol) {
      navigate(`/chart/${selectedSymbol}`, { replace: true });
    }
    // eslint-disable-next-line
  }, [selectedSymbol]);

  // Fetch prices with optional date filters
  const fetchPrices = () => {
    setLoading(true);
    setError("");
    let url = `${API_BASE}/api/prices/${selectedSymbol}`;
    const params = [];
    if (selectedAccount && selectedAccount !== "All") params.push(`account=${selectedAccount}`);
    if (startDate) params.push(`start=${startDate}`);
    if (endDate) params.push(`end=${endDate}`);
    if (params.length) url += "?" + params.join("&");
    fetch(url, { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get prices");
        return res.json();
      })
      .then((data) => {
          let arr = [];
        if (data && data.hist) {
          arr = Object.entries(data.hist).map(([time, price]) => ({
            time,
            price,
          }));
        }

        // Filter prices between startDate and endDate (inclusive)
        if (startDate) {
          arr = arr.filter(row => row.time.slice(0, 10) >= startDate);
        }
        if (endDate) {
          arr = arr.filter(row => row.time.slice(0, 10) <= endDate);
        }
          setPrices(arr);
        setPage(1);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to get prices.");
        setLoading(false);
      });
  };

    // Fetch trades for selected account and symbol
  const fetchTrades = () => {
    if (!selectedSymbol || !selectedAccount || selectedAccount === "All") {
      setTrades([]);
      return;
    }
    setTradesLoading(true);
    setTradesError("");
    fetch(`${API_BASE}/api/trades/${selectedAccount}/${selectedSymbol}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to get trades");
        return res.json();
      })
  .then(data => {
    // Ensure trade.date is in 'YYYY-MM-DDTHH:mm:ss' format (without timezone)
    const formatted = (data || []).map(trade => ({
      ...trade,
      date: trade.date
        ? trade.date.split(".")[0].replace(" ", "T") // handles 'YYYY-MM-DD HH:mm:ss.sss...' or 'YYYY-MM-DD HH:mm:ss'
        : ""
    }));
    setTrades(formatted);
    setTradesLoading(false);
  })
      .catch(() => {
        setTradesError("Failed to get trades.");
        setTrades([]);
        setTradesLoading(false);
      });
  };

  // Initial fetch and when symbol changes
  useEffect(() => {
    setStartDate("");
    setEndDate("");
    setPage(1);
    if (selectedSymbol) {
      fetchPrices();
      fetchTrades();
    }
    // eslint-disable-next-line
  }, [selectedSymbol, selectedAccount]);

  // Pagination logic
  const rowsPerPage = 100;
  const totalPages = Math.ceil(prices.length / rowsPerPage);
  const pagedPrices = prices.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Get min/max date from prices for dropdown options
  const allDates = prices.map(p => p.time.slice(0, 10));
  const uniqueDates = Array.from(new Set(allDates)).sort();

  // Chart data with trades overlay
  const chartData = {
    labels: prices.map((row) => row.time),
    datasets: [
      {
      label: `Price for ${selectedSymbol}`,
      data: prices.map(row => ({
        x: row.time,
        y: row.price,
      })),
      fill: false,
      borderColor: "blue",
      tension: 0.1,
      pointRadius: 0,
      type: "line",
    },
      // BUY trades as green dots
      {
        label: "BUY Trades",
        data: trades
          .filter(trade => trade.action && trade.action.toUpperCase() === "BUY")
          .map(trade => ({
            x: trade.date_iso,
            y: trade.price,
          })),
        showLine: false,
        pointBackgroundColor: "green",
        pointBorderColor: "green",
        pointRadius: 6,
        type: "scatter",
      },
      // SELL trades as red dots
      {
        label: "SELL Trades",
        data: trades
          .filter(trade => trade.action && trade.action.toUpperCase() === "SELL")
          .map(trade => ({
            x: trade.date_iso,
            y: trade.price,
          })),
        showLine: false,
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointRadius: 6,
        type: "scatter",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        type: "time",
           time: {
        tooltipFormat: "yyyy-MM-dd HH:mm",
        displayFormats: {
          hour: "yyyy-MM-dd HH:mm",
          minute: "HH:mm",
          day: "yyyy-MM-dd",
        },
      },
        title: { display: true, text: "Time" },
      },
      y: {
        title: { display: true, text: "Price" },
      },
    },
  };

  return (
    <div>
      <h1>Chart for {selectedSymbol}</h1>
      <button className="add-btn"  onClick={() => navigate("/Requests")}>Back to Home</button>
      {/* Date filter controls */}
     {/* Symbol filter */}
        <label>
          Symbol:{" "}
          <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}>
            {symbols.map(sym => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </label>
      {/* Account filter */}
      <div style={{ margin: "1rem 0", display: "flex", gap: "1rem", alignItems: "center" }}>
        <label>
          Account:{" "}
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
            <option value="All">All</option>
            {accounts.map(acc => (
              <option key={acc.id || acc} value={acc.id || acc}>
                {acc.id || acc}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start date:{" "}
          <select value={startDate} onChange={e => setStartDate(e.target.value)}>
            <option value="">(Any)</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </label>
        <label>
          End date:{" "}
          <select value={endDate} onChange={e => setEndDate(e.target.value)}>
            <option value="">(Any)</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </label>
        <button className="add-btn" onClick={() => { setPage(1); fetchPrices(); fetchTrades(); }}>
          Refresh
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && prices.length > 0 && (
        <>
          <div style={{ maxWidth: 1200 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          <div style={{ display: "flex", gap: "2rem", margin: "1rem 0" }}>
            {/* Prices Table */}
            <div style={{ flex: 1 }}>
              <h3>Prices</h3>
              <div>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span style={{ margin: "0 1rem" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
              <table border="1" cellPadding="8">
                <thead>
                  <tr>
                    {Object.keys(pagedPrices[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPrices.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Trades Table */}
            <div style={{ flex: 1 }}>
              <h3>Trades</h3>
              {tradesLoading && <p>Loading trades...</p>}
              {tradesError && <p style={{ color: "red" }}>{tradesError}</p>}
              {!tradesLoading && trades.length > 0 && (
                <table border="1" cellPadding="8">
                  <thead>
                    <tr>
                      {Object.keys(trades[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade, idx) => (
                      <tr key={idx}>
                        {Object.values(trade).map((val, i) => (
                          <td key={i}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!tradesLoading && trades.length === 0 && <p>No trades found for this account and symbol.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChartsTab;