import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { BookOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';

const TeacherDashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Welcome, Teacher 👩‍🏫</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Courses"
              value={12}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Students"
              value={120}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Upcoming Classes"
              value={5}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 40 }}>
        <Card title="Recent Activity">
          <p>• Graded assignments for English A2</p>
          <p>• Created new course: IELTS Foundation</p>
          <p>• Updated quiz in Grammar B1</p>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
