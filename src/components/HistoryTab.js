import React from "react";
import { Line } from "react-chartjs-2";

export default function HistoryTab({ history, loading, selectedAccountId }) {
    // Sort history by date ascending
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Find min and max for the y-axis (assuming 'value' is the y field)
  let minY = 0, maxY = 0;
  if (sortedHistory.length > 0) {
    const values = sortedHistory.map(row => Number(row.value));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    minY = Math.floor(minValue / 1000) * 1000;
    maxY = Math.ceil(maxValue / 1000) * 1000;
  }
  // Calculate cumulative performance and volatility
const performances = sortedHistory
  .map(row => Number(row.performance))
  .filter(val => !isNaN(val));
// Assume daily performance, 252 trading days per year
const tradingDays = 252;
const cumulativePerformance = performances.reduce((acc, val) => acc + val, 0);

// Annualized performance (geometric)
const totalReturn = performances.reduce((acc, val) => acc * (1 + val), 1) - 1;
const annualizedPerformance = performances.length
  ? Math.pow(1 + totalReturn, tradingDays / performances.length) - 1
  : 0;


const mean = performances.length
  ? performances.reduce((acc, val) => acc + val, 0) / performances.length
  : 0;
const variance = performances.length
  ? performances.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / performances.length
  : 0;
const volatility = Math.sqrt(variance*tradingDays);
// Sharpe ratio (risk-free rate assumed 0)
const sharpeRatio = volatility !== 0 ? annualizedPerformance / (volatility ) : 0;

// Sortino ratio (downside deviation)
const negativeReturns = performances.filter(val => val < 0);
const downsideDeviation = negativeReturns.length
  ? Math.sqrt(negativeReturns.reduce((acc, val) => acc + Math.pow(val, 2), 0) / negativeReturns.length)
  : 0;
const sortinoRatio = downsideDeviation !== 0 ? mean / downsideDeviation * Math.sqrt(tradingDays) : 0;


  const chartData = {
  labels: sortedHistory.map(row => row.date),
  datasets: [
    {
      label: "Account Value",
      data: sortedHistory.map(row => row.value),
      fill: false,
      borderColor: "blue",
      tension: 0.1,
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
      type: "category",
      title: { display: true, text: "Time" },
      ticks: {
        callback: function(value, index, ticks) {
          // value is the label (date string)
          // Show only YYYY-MM-DD (first 10 chars)
          const label = this.getLabelForValue(value);
          return label ? label.slice(0, 11) : value;
        }
      }
    },
    y: {
      title: { display: true, text: "Price" },
    },
  },
};

  return (
    <><h1>
        Account 
        {selectedAccountId ? ` ${selectedAccountId}` : ""} History </h1>
      {selectedAccountId === null ? (
        <p>Select an account to view its history.</p>
      ) : loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <p>No history found for this account.</p>
      ) : (
        <>
<div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", maxWidth: 1200 }}>
  <div style={{ flex: 3 }}>
    <Line data={chartData} options={chartOptions} />
  </div>
  <div className="stats-box">
    <h3>Stats</h3>
    <div>
      <strong>Cumulative Performance:</strong>{" "}
      {(cumulativePerformance * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
    </div>
    <div>
      <strong>Volatility:</strong>{" "}
      {(volatility * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
    </div>
    <div>
  <strong>Annualized Performance:</strong>{" "}
  {(annualizedPerformance * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %
</div>
<div>
  <strong>Sharpe Ratio:</strong>{" "}
  {sharpeRatio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>
<div>
  <strong>Sortino Ratio:</strong>{" "}
  {sortinoRatio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>
  </div>
</div>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                {Object.keys(history[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr key={idx}>
                {Object.entries(row).map(([key, val], i) => (
                <td key={i}>
                  {key === "performance" 
                ? (val * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %"
                : typeof val === "number"
                ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : val}
              </td>
            ))}
          </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}