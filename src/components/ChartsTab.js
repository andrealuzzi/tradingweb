import React, { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
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
function ChartsTab() {
  const { symbol } = useParams();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  useEffect(() => {
    setLoading(true);
    fetch(`/api/prices/${symbol}`, { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get prices");
        return res.json();
      })
      .then((data) => {
        // Convert {hist: {time: price, ...}} to [{time, price}, ...]
        if (data && data.hist) {
          const arr = Object.entries(data.hist).map(([time, price]) => ({
            time,
            price,
          }));
          setPrices(arr);
        } else {
          setPrices([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to get prices.");
        setLoading(false);
      });
  }, [symbol]);

  // Pagination logic
  const rowsPerPage = 100; // Set the number of rows per page
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(prices.length / rowsPerPage);
  const pagedPrices = prices.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Prepare data for the chart
  const chartData = {
    labels: prices.map((row) => row.time),
    datasets: [
      {
        label: `Price for ${symbol}`,
        data: prices.map((row) => row.price),
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
      type: "category", // or "time" if you want time scale and have the adapter
      title: { display: true, text: "Time" },
    },
    y: {
      title: { display: true, text: "Price" },
    },
  },
};
console.log("Prices:", prices);
  return (
 <div>
      <h1>Chart for {symbol}</h1>
      <button onClick={() => navigate("/Requests")}>Back to Home</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error  && prices.length > 0  && (
        <>
          <div style={{ maxWidth: 1200 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        <div style={{ margin: "1rem 0" }}>
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
        </>
      )}
      {!loading && !error && prices.length === 0 && <p>No price data found.</p>}
    </div>
  );
}

export default ChartsTab;