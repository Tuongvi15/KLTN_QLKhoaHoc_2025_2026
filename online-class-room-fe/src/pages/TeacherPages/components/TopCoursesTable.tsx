// src/pages/TeacherDashboard/components/TopCoursesTable.tsx
import { Avatar, Card, Table, Tag, Typography } from "antd";
import { RiseOutlined } from "@ant-design/icons";
import React from "react";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

// 👉 Define type for each record of topCourses
export interface TopCourseRecord {
  courseId: number;
  title: string;
  imageUrl?: string;
  totalStudents: number;
  revenue: number;
}

// 👉 Define props
interface TopCoursesProps {
  topCourses: TopCourseRecord[];
}

const TopCoursesTable: React.FC<TopCoursesProps> = ({ topCourses }) => {
  // 👉 Make columns typed
  const columns: ColumnsType<TopCourseRecord> = [
    {
      title: "Khóa học",
      key: "title",
      render: (_: any, record: TopCourseRecord) => (
        <div className="flex items-center gap-3">
          <Avatar shape="square" size={48} src={record.imageUrl} />
          <div>
            <Text strong>{record.title}</Text>
            <br />
            <Tag color="blue">#{record.courseId}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "totalStudents",
      align: "center",
    },
    {
      title: "Doanh thu",
      key: "revenue",
      align: "right",
      render: (_: any, r: TopCourseRecord) => r.revenue.toLocaleString("vi-VN"),
    },
  ];

  return (
    <Card
      title={<span><RiseOutlined /> Top khóa học nổi bật</span>}
      className="rounded-xl shadow-lg"
    >
      <Table<TopCourseRecord>
        columns={columns}
        dataSource={topCourses}
        pagination={false}
        rowKey="courseId"
      />
    </Card>
  );
};

export default TopCoursesTable;
