import { Button, Card, Empty } from "antd";
import { Link } from "react-router-dom";

export default function EmptyState() {
  return (
    <div className="p-8">
      <Card className="text-center rounded-xl">
        <Empty description="Bạn chưa có khóa học nào" />
        
        <Link to="/teacher/addCourse">
          <Button type="primary" className="mt-4">
            Tạo khóa học ngay
          </Button>
        </Link>
      </Card>
    </div>
  );
}
