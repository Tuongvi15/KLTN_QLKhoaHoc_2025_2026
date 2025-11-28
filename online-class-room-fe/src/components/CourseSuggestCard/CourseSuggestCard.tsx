import { Card, Button } from "antd";
import { useNavigate } from "react-router-dom";

const CourseSuggestCard = ({ course }: any) => {
  const navigate = useNavigate();

  return (
    <Card
      className="rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200"
      onClick={() => navigate(`/courses/${course.courseId}`)}
    >
      <div className="flex gap-4">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-28 h-20 object-cover rounded-lg shadow-sm"
        />

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
            {course.courseLevel ? `Level ${course.courseLevel}` : "Khóa học phù hợp với bạn"}
          </p>

          <Button
            size="small"
            className="mt-3 bg-blue-500 text-white rounded-lg px-3"
          >
            Xem chi tiết
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CourseSuggestCard;
