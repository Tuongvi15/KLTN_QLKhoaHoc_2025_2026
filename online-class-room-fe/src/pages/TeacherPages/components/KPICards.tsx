// src/pages/TeacherDashboard/components/KPICards.tsx
import { Card, Col, Row, Statistic } from "antd";
import { BookOutlined, TeamOutlined, DollarOutlined, WalletOutlined } from "@ant-design/icons";
import React from "react";

interface KPICardsProps {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalProfit: number;
}

const KPICards: React.FC<KPICardsProps> = ({
  totalCourses,
  totalStudents,
  totalRevenue,
  totalProfit,
}) => {
  const cards = [
    {
      title: "Tổng khóa học",
      value: totalCourses,
      icon: <BookOutlined style={{ fontSize: 24 }} />,
      color: "#5624d0",
    },
    {
      title: "Tổng học viên",
      value: totalStudents,
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      color: "#0f7c90",
    },
    {
      title: "Doanh thu",
      value: totalRevenue.toLocaleString("vi-VN") + " ₫",
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: "#f4511e",
    },
    {
      title: "Thực nhận",
      value: totalProfit.toLocaleString("vi-VN") + " ₫",
      icon: <WalletOutlined style={{ fontSize: 24 }} />,
      color: "#00a67e",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card
            bordered={false}
            style={{
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
            }}
            bodyStyle={{ padding: "20px" }}
            className="hover:shadow-md"
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: `${card.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.color,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: "#6a6f73",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#1c1d1f",
                    lineHeight: 1.2,
                  }}
                >
                  {card.value}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default KPICards;