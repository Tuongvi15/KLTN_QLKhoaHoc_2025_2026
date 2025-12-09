// DashboardPage.tsx

import { Spin } from 'antd';
import Card from './Card/Card';
import Chart from './chart/Chart';
import { cards } from './data/data';

import { useGetPendingTeachersQuery } from '../../../services/account.services';
import { useGetCourselistPaginationQuery } from '../../../services/course.services';
import dayjs from 'dayjs';

const DashboardPage = () => {
    // 🧑 Admin info
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const adminName = user?.fullName || "Quản trị viên";

    // 🌤 Tạo lời chào theo thời gian
    const hour = dayjs().hour();
    let greeting = "";

    if (hour >= 5 && hour < 11) greeting = "Chào buổi sáng";
    else if (hour >= 11 && hour < 13) greeting = "Chào buổi trưa";
    else if (hour >= 13 && hour < 18) greeting = "Chào buổi chiều";
    else if (hour >= 18 && hour < 23) greeting = "Chào buổi tối";
    else greeting = "Chúc bạn ngủ ngon";

    // 👉 Lấy giảng viên chờ duyệt
    const { data: pendingTeachers } = useGetPendingTeachersQuery();

    // 👉 Lấy khóa học cần duyệt (isPublished = false)
    const { data: pendingCourses } = useGetCourselistPaginationQuery({
        pageNumber: 1,
        pageSize: 1000,
        isPublished: false,
    });

    const totalPendingTeachers = pendingTeachers?.length ?? 0;
    const totalPendingCourses = pendingCourses?.courses?.length ?? 0;

    return (
        <div className="flex flex-col gap-6 w-full">

            {/* 🔵 WELCOME CARD CHUẨN UI */}
            <div className="w-full rounded-2xl shadow-md p-7 bg-gradient-to-r from-[#004aad] to-[#0d6efd] text-white">
                
                {/* ICON + TIME */}
                <div className="flex items-center gap-3 opacity-80">
                    <span className="text-sm">🌤 Hồ Chí Minh • {dayjs().format("DD/MM/YYYY")} </span>
                </div>

                {/* GREETING */}
                <h1 className="text-3xl font-bold mt-2">
                    {greeting}, {adminName}!
                </h1>

                {/* DESCRIPTION */}
                <p className="text-lg mt-2 opacity-90">
                    Hệ thống đã tự động sắp xếp ưu tiên cho bạn. 
                    Bạn có <span className="underline font-semibold">{totalPendingCourses}</span> khóa học cần duyệt và 
                    <span className="underline font-semibold"> {totalPendingTeachers}</span> giảng viên đang chờ duyệt hôm nay.
                </p>
            </div>

            {/* 🟦 2 Mini Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer">
                    <h3 className="text-gray-700 font-semibold text-lg">Khóa học cần duyệt</h3>
                    <p className="text-4xl text-[#1677ff] font-bold mt-2">
                        {totalPendingCourses}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer">
                    <h3 className="text-gray-700 font-semibold text-lg">Giảng viên chờ duyệt</h3>
                    <p className="text-4xl text-[#ff9800] font-bold mt-2">
                        {totalPendingTeachers}
                    </p>
                </div>
            </div>

            {/* 🟩 CARD 4 CHỈ SỐ */}
            <div className="flex justify-between gap-4">
                {cards.map((item) => (
                    <Card key={item.id} item={item} />
                ))}
            </div>

            {/* 📊 BIỂU ĐỒ */}
            <div className="flex flex-row gap-4">
                <Chart />
            </div>
        </div>
    );
};

export default DashboardPage;
