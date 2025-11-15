import { Button, Input, Table, Tooltip, Modal, message, Tag } from "antd";
import { useState } from "react";
import {
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    resetCourse,
    setCourseMode,
    setCourseCreatedData,
    CouseMode,
} from "../../slices/courseSlice";

import {
    useDeleteCourseMutation,
    useGetCoursesByTeacherQuery,
} from "../../services/course.services";

import { Course } from "../../types/Course.type";
import { RootState } from "../../store";
import CreateCourseModal from "./CreateCourseModal/CreateCourseModal";

const GetAllCourseTeacher = () => {
    const teacherId = useSelector((state: RootState) => state.user.id);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: courses, isFetching, refetch } = useGetCoursesByTeacherQuery(
        teacherId,
        { skip: !teacherId }
    );

    const [deleteCourse] = useDeleteCourseMutation();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);

    const filteredCourses =
        courses?.filter((c: Course) =>
            c.title?.toLowerCase().includes(searchValue.toLowerCase())
        ) || [];

    const handleDelete = (courseId: number) => {
        setDeletingId(courseId);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteCourse(deletingId);
            message.success("Xóa khóa học thành công!");
            refetch();
        } catch {
            message.error("Xóa thất bại!");
        } finally {
            setDeleteModalVisible(false);
        }
    };

    const cancelDelete = () => setDeleteModalVisible(false);

    const columns = [
        { title: "Tên khóa học", dataIndex: "title", key: "title" },
        {
            title: "Giá tiền",
            dataIndex: "price",
            render: (price: number) => <span>{price?.toLocaleString()} đ</span>,
        },
        {
            title: "Xuất bản",
            dataIndex: "isPublic",
            render: (isPublic: boolean) =>
                isPublic ? <Tag color="green">Đã xuất bản</Tag> : <Tag color="red">Chưa xuất bản</Tag>,
        },
        {
            title: "Trạng thái",
            dataIndex: "courseIsActive",
            render: (active: boolean) =>
                active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Chưa kích hoạt</Tag>,
        },

        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: Course) => (
                <div style={{ display: "flex", justifyContent: "left", gap: 10 }}>

                    {/* 1️⃣ Chỉnh sửa chương trình học */}
                    <Tooltip
                        title={
                            record.courseIsActive
                                ? "Khóa học đang hoạt động — Không thể chỉnh sửa nội dung!"
                                : "Chỉnh sửa chương trình học"
                        }
                    >
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            disabled={record.courseIsActive === true}
                            onClick={() =>
                                navigate(`/teacher/updateCourse/${record.courseId}`)
                            }
                        />
                    </Tooltip>

                    {/* ⭐ 2️⃣ Sửa thông tin khóa học */}
                    {!record.courseIsActive && (
                        <Tooltip title="Chỉnh sửa thông tin khóa học">
                            <Button
                                type="link"
                                icon={<EditOutlined style={{ color: "#1677ff" }} />}
                                onClick={async () => {
                                    try {
                                        // ⭐ fetch thủ công — không lỗi TS
                                        const user = localStorage.getItem("user");
                                        const token = user ? JSON.parse(user).accessToken : "";

                                        const res = await fetch(
                                            `https://localhost:7005/api/Course/GetCourseDetailById/${record.courseId}`,
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        );

                                        const data = await res.json();
                                        const detail = data?.dataObject || data;

                                        dispatch(setCourseMode(CouseMode.UPDATE));
                                        dispatch(setCourseCreatedData(detail));

                                        setOpenCreateModal(true);
                                    } catch (err) {
                                        message.error("Không tải được dữ liệu khóa học!");
                                    }
                                }}
                            >
                                Sửa thông tin
                            </Button>
                        </Tooltip>
                    )}

                    {/* 3️⃣ Review khóa học */}
                    <Tooltip title="Xem trước & gửi admin duyệt">
                        <Button
                            type="link"
                            icon={<SendOutlined />}
                            onClick={() =>
                                navigate(`/teacher/reviewCourse/${record.courseId}`)
                            }
                        />
                    </Tooltip>

                    {/* 4️⃣ Xóa khóa học */}
                    <Tooltip title="Xóa khóa học">
                        <Button
                            danger
                            type="link"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.courseId!)}
                        />
                    </Tooltip>

                </div>
            ),
        },
    ];

    return (
        <div className="mx-auto w-[98%]">
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl font-bold text-gray-700">Khóa học của tôi</h1>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="bg-blue-500"
                    onClick={() => {
                        dispatch(resetCourse());
                        setOpenCreateModal(true);
                    }}
                >
                    Thêm khóa học mới
                </Button>
            </div>

            <Input.Search
                placeholder="Tìm khóa học..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="mb-4 w-[40%]"
            />

            <Table
                columns={columns}
                dataSource={filteredCourses}
                loading={isFetching}
                rowKey="courseId"
                pagination={{
                    pageSize: 7,
                    position: ["bottomRight"],
                }}
            />

            {/* Modal xác nhận xóa */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{ className: "bg-blue-500 text-white" }}
            >
                <p>Bạn có chắc chắn muốn xóa khóa học này?</p>
            </Modal>

            {/* Modal tạo / sửa khóa học */}
            <CreateCourseModal
                open={openCreateModal}
                onClose={() => {
                    setOpenCreateModal(false);
                    refetch();
                }}
            />
        </div>
    );
};

export default GetAllCourseTeacher;
