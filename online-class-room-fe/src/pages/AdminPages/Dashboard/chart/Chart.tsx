import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { useCountStudentPerCourseQuery } from "../../../../services/course.services";
import { Spin, Empty } from "antd";
import { useRef, useEffect } from "react";

const BieuDoKhoaHoc = () => {
    const { data: duLieuKhoaHoc, isLoading, isError } =
        useCountStudentPerCourseQuery();

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // ✅ Ngăn cuộn dọc toàn trang khi người dùng cuộn ngang trong chart
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY; // Chuyển cuộn dọc thành cuộn ngang
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, []);

    if (isLoading)
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl bg-white shadow">
                <Spin size="large" tip="Đang tải dữ liệu biểu đồ..." />
            </div>
        );

    if (isError)
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl bg-white shadow text-red-500">
                Lỗi khi tải dữ liệu biểu đồ 😢
            </div>
        );

    if (!duLieuKhoaHoc || duLieuKhoaHoc.length === 0)
        return (
            <div className="flex h-[400px] items-center justify-center rounded-xl bg-white shadow">
                <Empty description="Chưa có dữ liệu khóa học" />
            </div>
        );

    const duLieuDinhDang = duLieuKhoaHoc.map((khoa) => ({
        tenKhoaHoc:
            khoa.courseTitle.length > 25
                ? khoa.courseTitle.slice(0, 25) + "..."
                : khoa.courseTitle,
        tongHocVien: khoa.totalStudents,
    }));

    return (
        <div className="w-full h-[550px] rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-[#1677ff]">
                📈 Biểu đồ tổng số học viên theo từng khóa học
            </h2>

            {/* ✅ KHỐI BIỂU ĐỒ CÓ CUỘN NGANG RIÊNG BIỆT */}

            <div className="min-w-[1000px]">
                <ResponsiveContainer width="100%" height={420}>
                    <LineChart
                        data={duLieuDinhDang}
                        margin={{ top: 10, right: 30, left: 10, bottom: 70 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="tenKhoaHoc"
                            angle={-25}
                            textAnchor="end"
                            interval={0}
                            height={80}
                            tick={{ fontSize: 13 }}
                        />
                        <YAxis
                            label={{
                                value: "Số học viên",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: "middle", fontSize: 13, fill: "#555" },
                            }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ stroke: "#1677ff", strokeWidth: 1 }}
                            contentStyle={{
                                background: "#ffffff",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                border: "none",
                            }}
                            labelStyle={{ color: "#1677ff", fontWeight: 600 }}
                            formatter={(value) => [`${value} học viên`, "Tổng số"]}
                            labelFormatter={(label) => `Khóa học: ${label}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="tongHocVien"
                            stroke="#1677ff"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#1677ff" }}
                            activeDot={{ r: 6 }}
                            name="Số học viên"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BieuDoKhoaHoc;
