import { Avatar, Rating } from "@mui/material";
import { Skeleton } from "antd";
import { useGetRatingListQuery } from "../../services/ratingCourse.services";

interface RatingCourseListProps {
    courseId: number;
}

const RatingCourseList = ({ courseId }: RatingCourseListProps) => {
    const { data, isLoading } = useGetRatingListQuery(courseId);

    if (isLoading) return <Skeleton active />;

    if (!data || data.length === 0)
        return <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>;

    return (
        <div className="flex flex-col gap-4">
            {data.map((item: any) => (
                <div key={item.ratingId} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex gap-4 items-start">
                        <Avatar
                            src={item.avatarUrl}
                            style={{ width: 48, height: 48 }}
                        />
                        <div className="flex-1">
                            <p className="font-bold text-gray-700">{item.userName}</p>

                            <Rating
                                value={item.rating}
                                readOnly
                                precision={0.5}
                                size="small"
                            />

                            <p className="text-sm mt-1">{item.comment}</p>

                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(item.ratingDate).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RatingCourseList;
