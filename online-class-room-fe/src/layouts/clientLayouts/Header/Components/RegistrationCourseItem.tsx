import { useEffect, useState } from 'react';
import { Course } from '../../../../types/Course.type';
import { formatNumberWithCommas } from '../../../../utils/NumberFormater';
import { useGetCourseIDQuery } from '../../../../services';
import { Link } from 'react-router-dom';

interface Props {
    courseId: number;
}

const RegistrationCourseItem = ({ courseId }: Props) => {
    const [course, setCourse] = useState<Course>();
    const { data, isSuccess } = useGetCourseIDQuery(courseId ? courseId.toString() : '');

    useEffect(() => {
        if (isSuccess && data) {
            setCourse(data);
        }
    }, [isSuccess, data]);

    const finalPrice =
        course?.price != null && course?.salesCampaign != null
            ? Math.round(course.price * (1 - course.salesCampaign))
            : course?.price ?? 0;

    return (
        <Link to={`/courses/${courseId}`}>
            <div className="flex cursor-pointer gap-2 px-2 hover:text-[#a435f0]">
                <div className="flex h-[55px] w-[80px] items-center justify-center overflow-hidden bg-black py-1">
                    <img className="w-full" src={course?.imageUrl} alt="" />
                </div>

                <div className="flex-1 flex-col">
                    <h2 className="line-clamp-2 text-ellipsis text-sm font-medium leading-4">
                        {course?.title}
                    </h2>

                    <div className="mt-1 flex items-center gap-2">
                        {course?.salesCampaign != null && course.salesCampaign > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatNumberWithCommas(course.price)}₫
                            </span>
                        )}

                        <span className="text-sm font-medium text-red-400">
                            {formatNumberWithCommas(finalPrice)}₫
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default RegistrationCourseItem;
