import { Avatar, Rating } from "@mui/material";
import { Skeleton } from "antd";
import { useGetRatingListQuery } from "../../../services/ratingCourse.services";

interface Props {
    courseId: number;
}

const RatingCourseList = ({ courseId }: Props) => {
    const { data, isLoading } = useGetRatingListQuery(courseId);

    if (isLoading) return <Skeleton active />;

    if (!data || data.length === 0)
        return <p className="text-gray-500 italic mt-3">Chưa có đánh giá nào.</p>;

    return (
        <div className="flex flex-col gap-4 mt-4">
            {data.map((item: any) => (
                <div
                    key={item.ratingId}
                    className="bg-white rounded-lg shadow p-4 border border-gray-100"
                >
                    <div className="flex gap-4 items-start">
                        <Avatar
                            src={item.avatarUrl}
                            style={{ width: 48, height: 48 }}
                        />

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-[#2d2f31] text-sm">
                                    {item.userName}
                                </p>

                                <span className="text-xs text-gray-500">
                                    {new Date(item.ratingDate).toLocaleDateString("vi-VN")}
                                </span>
                            </div>

                            <Rating
                                value={item.rating}
                                precision={0.5}
                                readOnly
                                size="small"
                                className="mt-1"
                            />

                            <p className="mt-2 text-sm text-[#2d2f31]">
                                {item.comment}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RatingCourseList;
