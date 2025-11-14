// src/pages/TeacherDashboard/components/KPICards.tsx
import { Card, Col, Row, Statistic } from "antd";
import { BookOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";
import React from "react";

// 👉 Khai báo type props
interface KPICardsProps {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

const KPICards: React.FC<KPICardsProps> = ({
  totalCourses,
  totalStudents,
  totalRevenue,
}) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card
          style={{ background: "linear-gradient(135deg,#1677ff,#69c0ff)", color: "white" }}
        >
          <Statistic
            title="Tổng khóa học"
            value={totalCourses}
            prefix={<BookOutlined />}
            valueStyle={{ color: "white" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card
          style={{ background: "linear-gradient(135deg,#52c41a,#95de64)", color: "white" }}
        >
          <Statistic
            title="Tổng học viên"
            value={totalStudents}
            prefix={<TeamOutlined />}
            valueStyle={{ color: "white" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card
          style={{ background: "linear-gradient(135deg,#faad14,#ffe58f)", color: "white" }}
        >
          <Statistic
            title="Tổng doanh thu"
            value={totalRevenue.toLocaleString("vi-VN")}
            prefix={<DollarOutlined />}
            valueStyle={{ color: "white" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default KPICards;
