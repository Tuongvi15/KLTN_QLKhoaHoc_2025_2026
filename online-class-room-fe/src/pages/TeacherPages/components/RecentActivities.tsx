// src/pages/TeacherDashboard/components/RecentActivities.tsx
import { Avatar, Card, Empty, List, Tag, Typography } from "antd";
import React from "react";
const { Text } = Typography;

// 👉 Type for each activity item
export interface RecentActivity {
  studentId: string;
  name: string;
  courseId: number;
  joinedAt: string; // ISO string
}

// 👉 Props type
interface RecentActivitiesProps {
  recent: RecentActivity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ recent }) => {
  return (
    <Card title="Hoạt động gần đây" className="rounded-xl shadow-lg">
      {recent.length === 0 ? (
        <Empty description="Không có hoạt động" />
      ) : (
        <List<RecentActivity>
          itemLayout="horizontal"
          dataSource={recent}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{item.name.charAt(0)}</Avatar>}
                title={<Text strong>{item.name}</Text>}
                description={`Đăng ký khóa #${item.courseId} • ${new Date(
                  item.joinedAt
                ).toLocaleString()}`}
              />
              <Tag color="green">MỚI</Tag>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RecentActivities;
