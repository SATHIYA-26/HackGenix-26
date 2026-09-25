"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function TimelineChart({ accountType }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    let posData = [320, 410, 480, 560, 620, 710, 840, 920];
    let negData = [80, 95, 70, 85, 60, 75, 55, 64];
    let neuData = [110, 130, 145, 160, 150, 180, 190, 210];

    if (accountType === "youtube") {
      posData = [4500, 6200, 8900, 14200, 21000, 34000, 48000, 68000];
      negData = [300, 450, 520, 800, 950, 1100, 1400, 1800];
      neuData = [900, 1200, 1800, 2500, 3100, 4200, 5400, 7100];
    } else if (accountType === "play_store") {
      posData = [12000, 14500, 18200, 16400, 19500, 24000, 28000, 31000];
      negData = [4100, 3800, 6200, 7800, 5400, 4900, 5100, 4800];
      neuData = [3200, 3600, 4100, 4500, 4200, 4800, 5100, 5500];
    }

    const ctx = canvasRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["W1 Aug", "W2 Aug", "W3 Aug", "W4 Aug", "W1 Sep", "W2 Sep", "W3 Sep", "W4 Sep"],
        datasets: [
          {
            label: "Positive Sentiment",
            data: posData,
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.08)",
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
          },
          {
            label: "Negative Sentiment",
            data: negData,
            borderColor: "#E11D48",
            backgroundColor: "rgba(225, 29, 72, 0.06)",
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
          },
          {
            label: "Neutral Sentiment",
            data: neuData,
            borderColor: "#64748B",
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: { color: "#71717A", font: { family: "Inter", size: 12, weight: 500 } },
          },
        },
        scales: {
          x: {
            grid: { color: "#F4F1EA" },
            ticks: { color: "#71717A", font: { family: "Inter" } },
          },
          y: {
            grid: { color: "#F4F1EA" },
            ticks: { color: "#71717A", font: { family: "Inter" } },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [accountType]);

  return (
    <div style={{ height: "280px", position: "relative" }}>
      <canvas id="timelineChart" ref={canvasRef}></canvas>
    </div>
  );
}
