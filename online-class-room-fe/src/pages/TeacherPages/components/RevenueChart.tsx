// src/pages/TeacherDashboard/components/RevenueChart.tsx
import { Card, Empty } from "antd";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { LineChartOutlined } from "@ant-design/icons";
import React from "react";

interface RevenueChartProps {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: any;
      borderColor?: any;
      borderWidth?: number;
      borderRadius?: number;
    }[];
  };
}

const RevenueChart: React.FC<RevenueChartProps> = ({ chartData }) => {
  // Tối ưu màu sắc theo Udemy
  const optimizedChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: "#5624d0",
      borderColor: "#5624d0",
      borderRadius: 4,
      barThickness: 40,
      maxBarThickness: 50,
    })),
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1c1d1f",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 4,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6a6f73",
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: "#f7f9fa",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6a6f73",
          callback: (value: any) => {
            return value.toLocaleString("vi-VN") + " ₫";
          },
        },
      },
    },
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LineChartOutlined style={{ color: "#5624d0" }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1c1d1f" }}>
            Doanh thu theo khóa học
          </span>
        </div>
      }
      bordered={false}
      style={{
        borderRadius: 8,
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      }}
    >
      {chartData.labels?.length > 0 ? (
        <div style={{ height: 320 }}>
          <Bar data={optimizedChartData} options={options} />
        </div>
      ) : (
        <div style={{ padding: "40px 0" }}>
          <Empty description="Chưa có dữ liệu doanh thu" />
        </div>
      )}
    </Card>
  );
};

export default RevenueChart;