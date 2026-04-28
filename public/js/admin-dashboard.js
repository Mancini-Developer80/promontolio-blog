/**
 * admin-dashboard.js
 * Inizializza i grafici Chart.js della dashboard admin.
 * Richiede: Chart.js (cdn.jsdelivr.net/npm/chart.js)
 * Dati: letti dall'attributo data-analytics su #analytics-data
 */
document.addEventListener("DOMContentLoaded", function () {
  const dataElement = document.getElementById("analytics-data");
  if (!dataElement) return;

  const analyticsData = JSON.parse(
    dataElement.getAttribute("data-analytics") || "{}",
  );

  // Impostazioni globali Chart.js
  Chart.defaults.font.family = "'Montserrat', sans-serif";
  Chart.defaults.color = "#333";

  // 1. Posts Timeline Chart
  const postsCtx = document.getElementById("postsChart");
  if (postsCtx) {
    new Chart(postsCtx.getContext("2d"), {
      type: "line",
      data: {
        labels: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu"],
        datasets: [
          {
            label: "Post",
            data: [0, 0, 0, 0, 0, 0],
            borderColor: "#556b2f",
            backgroundColor: "rgba(85, 107, 47, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
});
