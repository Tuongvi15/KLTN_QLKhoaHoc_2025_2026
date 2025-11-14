// src/pages/TeacherDashboard/components/RevenueChart.tsx
import { Card, Empty } from "antd";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { LineChartOutlined } from "@ant-design/icons";
import React from "react";

// 👉 Khai báo type "chuẩn" cho Chart.js
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
  return (
    <Card
      title={<span><LineChartOutlined /> Doanh thu theo khóa học</span>}
      className="rounded-xl shadow-lg"
    >
      {chartData.labels?.length > 0 ? (
        <div style={{ height: 360 }}>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      ) : (
        <Empty description="Không có dữ liệu" />
      )}
    </Card>
  );
};

export default RevenueChart;
