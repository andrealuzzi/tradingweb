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
const tradingDays = 250;
const cumulativePerformance = performances.reduce((acc, val) => acc + val, 0);

// Calculate win ratio: number of positive days / total number of days
const positiveDays = performances.filter(val => val >= 0).length;
const totalDays = performances.length;
const winRatio = totalDays >= 0 ? (positiveDays / totalDays) : 0;

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

// Calculate average win and average loss
const positiveValues = sortedHistory
  .filter(row => Number(row.performance) > 0)
  .map(row => Number(row.performance));
const negativeValues = sortedHistory
  .filter(row => Number(row.performance) < 0)
  .map(row => Number(row.performance));

const avgWin = positiveValues.length
  ? positiveValues.reduce((acc, performance) => acc + performance, 0) / positiveValues.length
  : 0;
const avgLoss = negativeValues.length
  ? negativeValues.reduce((acc, performance) => acc + performance, 0) / negativeValues.length
  : 0;


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
// Calculate max drawdown
function getMaxDrawdown(values) {
  let maxDrawdown = 0;
  let peak = values[0] || 0;
  for (let v of values) {
    if (v > peak) peak = v;
    const drawdown = (peak - v) / (peak === 0 ? 1 : peak);
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  return maxDrawdown;
}
const valueSeries = sortedHistory.map(row => Number(row.value));
const maxDrawdown = valueSeries.length > 0 ? getMaxDrawdown(valueSeries) : 0;

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
// Group by YYYY-MM and sum performance for each month
const monthlyPerformance = {};
sortedHistory.forEach(row => {
  if (!row.performance || isNaN(Number(row.performance))) return;
  const month = row.date.slice(0, 7); // "YYYY-MM"
  if (!monthlyPerformance[month]) monthlyPerformance[month] = 0;
  monthlyPerformance[month] += Number(row.performance);
});
const monthlyRows = Object.entries(monthlyPerformance)
  .sort(([a], [b]) => a.localeCompare(b)); // Sort by month ascending

  // Group by year and month
const monthlyMatrix = {};
sortedHistory.forEach(row => {
  if (!row.performance || isNaN(Number(row.performance))) return;
  const d = new Date(row.date);
const year = d.getFullYear().toString();
const month = (d.getMonth() + 1).toString().padStart(2, "0");
  if (!monthlyMatrix[year]) monthlyMatrix[year] = {};
  if (!monthlyMatrix[year][month]) monthlyMatrix[year][month] = 0;
  monthlyMatrix[year][month] += Number(row.performance);
});

// Get all years and months present in the data
const years = Object.keys(monthlyMatrix).sort();
const months = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12"
];
const yearlyCumulative = {};
years.forEach(year => {
  yearlyCumulative[year] = months.reduce((sum, month) => {
    return sum + (monthlyMatrix[year][month] || 0);
  }, 0);
});


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
      {(cumulativePerformance * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
    </div>
    <br />
    <div>
      <strong>Volatility:</strong>{" "}
      {(volatility * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
    </div>
    <br />
    <div>
  <strong>Annualized Performance:</strong>{" "}
  {(annualizedPerformance * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
</div>
<br />
<div>
  <strong>Sharpe Ratio:</strong>{" "}
  {sharpeRatio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>
<br />
<div>
  <strong>Sortino Ratio:</strong>{" "}
  {sortinoRatio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</div>
<br />
<div>
  <strong>Max Drawdown:</strong>{" "}
  {(100*maxDrawdown).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
</div>
<br />
  <div>
    <strong>Win Ratio:</strong>{" "}
    {(winRatio * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% ({positiveDays}/{totalDays})
  </div>
  <br />
  <div>
    <strong>Avg Win Value:</strong>{" "}
    {(avgWin* 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
  </div>
    <br />
    <div>
    <strong>Avg Loss Value:</strong>{" "}
    {(avgLoss*100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
  </div>
  </div>
</div>
<div style={{ marginTop: "2rem" }}>
  <h3>Monthly Performance</h3>
  <table border="1" cellPadding="8">
    <thead>
      <tr>
        <th>Year</th>
        {months.map(m => (
          <th key={m}>
            {new Date(2000, parseInt(m, 10) - 1).toLocaleString(undefined, { month: "short" })}
          </th>
        ))}
            <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {years.map(year => (
        <tr key={year}>
          <td>{year}</td>
          {months.map(month => (
            <td key={month}>
              {monthlyMatrix[year][month] !== undefined
                ? (monthlyMatrix[year][month] * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%"
                : ""}
            </td>
          ))}
                <td>
        {(yearlyCumulative[year] * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
      </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<hr style={{ margin: "2rem 0" }} /> {/* <-- Separator between tables */}
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
                  <td key={i} style={{ textAlign: typeof val === "number" ? "right" : "left" }}>
                  {key === "performance" 
                ? (val * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%"
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