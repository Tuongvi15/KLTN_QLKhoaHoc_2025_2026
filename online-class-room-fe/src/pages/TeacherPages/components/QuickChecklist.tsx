// src/pages/TeacherDashboard/components/QuickChecklist.tsx
import { Button, Card, List, Progress, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

// 👉 Type cho từng item trong checklist
export interface ChecklistItem {
  title: string;
  percent: number;
}

// 👉 Props type
interface QuickChecklistProps {
  checklist: ChecklistItem[];
}

const QuickChecklist: React.FC<QuickChecklistProps> = ({ checklist }) => {
  return (
    <Card title="Checklist nhanh" className="rounded-xl shadow-lg">
      <List<ChecklistItem>
        dataSource={checklist}
        renderItem={(item) => (
          <List.Item>
            <div className="w-full">
              <div className="flex justify-between">
                <Text>{item.title}</Text>
                <Text>{item.percent}%</Text>
              </div>

              <Progress percent={item.percent} size="small" showInfo={false} />
            </div>
          </List.Item>
        )}
      />

      <div className="text-right mt-4">
        <Button
          type="primary"
          href="/teacher/addCourse"
          icon={<PlusOutlined />}
        >
          Tạo khóa học mới
        </Button>
      </div>
    </Card>
  );
};

export default QuickChecklist;
