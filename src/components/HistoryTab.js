import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

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
          {/* Area Chart */}
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[minY, maxY]} />

                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
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
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
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