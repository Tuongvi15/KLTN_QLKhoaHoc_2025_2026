import { Button, Input, Table, Tooltip, Modal, message, Tag, DatePicker, Select, Space, Card } from "antd";
import { useState, useCallback, useMemo, memo } from "react";
import {
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    SendOutlined,
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

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

    const [fromDate, setFromDate] = useState<any>(null);
    const [toDate, setToDate] = useState<any>(null);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const { data: courses, isFetching, refetch } = useGetCoursesByTeacherQuery(
        teacherId,
        { skip: !teacherId }
    );

    const [deleteCourse] = useDeleteCourseMutation();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [openCreateModal, setOpenCreateModal] = useState(false);

    const allCategoryOptions = useMemo(() => {
        return Array.from(
            new Map(
                (courses || [])
                    .flatMap(c => c.categories || [])
                    .map(cat => [cat.categoryId, { label: cat.name, value: cat.categoryId }])
            ).values()
        );
    }, [courses]);

    const filteredCourses = useMemo(() => {
        return (courses || []).filter((c: Course) => {
            const matchText = c.title?.toLowerCase().includes(searchValue.toLowerCase());

            if (selectedCategories.length > 0) {
                const courseCatIds = (c.categories || []).map(cat => cat.categoryId);
                const matchCategory = selectedCategories.some(id => courseCatIds.includes(id));
                if (!matchCategory) return false;
            }

            if (fromDate || toDate) {
                const created = c.createAt ? dayjs(c.createAt) : null;
                if (!created) return false;

                if (fromDate && !created.isAfter(fromDate.startOf("day"))) return false;
                if (toDate && !created.isBefore(toDate.endOf("day"))) return false;
            }

            return matchText;
        });
    }, [courses, searchValue, selectedCategories, fromDate, toDate]);

    const handleDelete = useCallback((courseId: number) => {
        setDeletingId(courseId);
        setDeleteModalVisible(true);
    }, []);

    const confirmDelete = useCallback(async () => {
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
    }, [deletingId, deleteCourse, refetch]);

    const cancelDelete = useCallback(() => setDeleteModalVisible(false), []);

    const clearFilters = useCallback(() => {
        setSearchValue("");
        setFromDate(null);
        setToDate(null);
        setSelectedCategories([]);
        message.success("Đã xóa bộ lọc");
    }, []);

    const columns = useMemo(() => [
        {
            title: "Khóa học",
            dataIndex: "title",
            key: "title",
            render: (title: string, record: Course) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                        src={record.imageUrl || "/placeholder.jpg"}
                        alt={title}
                        style={{
                            width: 80,
                            height: 45,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #e0e0e0",
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#1c1d1f",
                                marginBottom: 4,
                            }}
                        >
                            {title}
                        </div>
                        <Space size={4}>
                            {record.isPublic ? (
                                <Tag color="green" style={{ margin: 0 }}>Đã xuất bản</Tag>
                            ) : (
                                <Tag color="orange" style={{ margin: 0 }}>Chưa xuất bản</Tag>
                            )}
                            {record.courseIsActive ? (
                                <Tag color="blue" style={{ margin: 0 }}>Hoạt động</Tag>
                            ) : (
                                <Tag color="default" style={{ margin: 0 }}>Chưa kích hoạt</Tag>
                            )}
                        </Space>
                    </div>
                </div>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            width: 140,
            align: "right" as const,
            render: (price: number, record: Course) => (
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1c1d1f" }}>
                        {price?.toLocaleString()} ₫
                    </div>
                    {record.salesCampaign > 0 && (
                        <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
                            -{(record.salesCampaign * 100)}%
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createAt",
            width: 140,
            render: (value: string) => (
                <div style={{ fontSize: 13, color: "#6a6f73" }}>
                    {value ? dayjs(value).format("DD/MM/YYYY") : ""}
                </div>
            ),
        },
        {
            title: "Cập nhật",
            dataIndex: "updateAt",
            width: 140,
            render: (value: string) => (
                <div style={{ fontSize: 13, color: "#6a6f73" }}>
                    {value ? dayjs(value).format("DD/MM/YYYY") : ""}
                </div>
            ),
        },
        {
            title: "Xuất bản",
            dataIndex: "isPublic",
            width: 120,
            render: (isPublic: boolean) => (
                <Tag
                    color={isPublic ? "green" : "red"}
                    style={{ fontSize: 12, margin: 0 }}
                >
                    {isPublic ? "Đã xuất bản" : "Chưa xuất bản"}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "courseIsActive",
            width: 120,
            render: (active: boolean) => (
                <Tag
                    color={active ? "green" : "red"}
                    style={{ fontSize: 12, margin: 0 }}
                >
                    {active ? "Hoạt động" : "Tạm khóa"}
                </Tag>
            ),
        },

        {
            title: "Thao tác",
            key: "action",
            width: 180,
            align: "center" as const,
            render: (_: any, record: Course) => (
                <Space size={4}>
                    <Tooltip title={record.isPublic ? "Khóa học đang hoạt động" : "Chỉnh sửa chương trình học"}>
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            disabled={record.isPublic === true}
                            onClick={() => navigate(`/teacher/updateCourse/${record.courseId}`)}
                            style={{ color: record.courseIsActive ? undefined : "#5624d0" }}
                        />
                    </Tooltip>

                    {!record.isPublic && (
                        <Tooltip title="Chỉnh sửa thông tin">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                style={{ color: "#5624d0" }}
                                onClick={async () => {
                                    try {
                                        const user = localStorage.getItem("user");
                                        const token = user ? JSON.parse(user).accessToken : "";

                                        const res = await fetch(
                                            `https://qlkhtt-backend-production.up.railway.app/api/Course/GetCourseDetailById/${record.courseId}`,
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );

                                        const data = await res.json();
                                        const detail = data?.dataObject || data;

                                        dispatch(setCourseMode(CouseMode.UPDATE));
                                        dispatch(setCourseCreatedData(detail));
                                        setOpenCreateModal(true);
                                    } catch (err) {
                                        message.error("Không tải được dữ liệu!");
                                    }
                                }}
                            />
                        </Tooltip>
                    )}

                    <Tooltip title="Xem trước & gửi duyệt">
                        <Button
                            type="text"
                            icon={<SendOutlined />}
                            style={{ color: "#00a67e" }}
                            onClick={() => navigate(`/teacher/reviewCourse/${record.courseId}`)}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa khóa học">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.courseIsActive === true || record.isPublic === true}
                            onClick={() => handleDelete(record.courseId!)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ], [navigate, dispatch]);

    return (
        <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24
            }}>
                <h1 style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#1c1d1f",
                    margin: 0
                }}>
                    Khóa học của tôi
                </h1>

                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    style={{
                        backgroundColor: "#5624d0",
                        borderColor: "#5624d0",
                        height: 44,
                        fontWeight: 600,
                    }}
                    onClick={() => {
                        dispatch(resetCourse());
                        setOpenCreateModal(true);
                    }}
                >
                    Tạo khóa học mới
                </Button>
            </div>

            {/* Filter Section */}
            <Card
                bordered={false}
                style={{
                    marginBottom: 20,
                    borderRadius: 8,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: 20 }}
            >
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <FilterOutlined style={{ color: "#5624d0" }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#1c1d1f" }}>
                            Bộ lọc
                        </span>
                    </div>

                    <Space wrap size={12} style={{ width: "100%" }}>
                        <Input
                            placeholder="Tìm kiếm khóa học..."
                            prefix={<SearchOutlined style={{ color: "#6a6f73" }} />}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />

                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Chọn danh mục"
                            style={{ minWidth: 240 }}
                            value={selectedCategories}
                            onChange={(v) => setSelectedCategories(v)}
                            options={allCategoryOptions}
                            maxTagCount="responsive"
                        />

                        <DatePicker
                            placeholder="Từ ngày"
                            value={fromDate}
                            onChange={setFromDate}
                            format="DD/MM/YYYY"
                            style={{ width: 150 }}
                        />

                        <DatePicker
                            placeholder="Đến ngày"
                            value={toDate}
                            format="DD/MM/YYYY"
                            style={{ width: 150 }}
                            onChange={(v) => {
                                if (fromDate && v && v.isBefore(fromDate, "day")) {
                                    message.warning("Ngày kết thúc không được nhỏ hơn ngày bắt đầu!");
                                    return;
                                }
                                setToDate(v);
                            }}
                        />

                        <Button
                            icon={<ClearOutlined />}
                            onClick={clearFilters}
                            style={{ marginLeft: "auto" }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Space>
                </Space>
            </Card>

            {/* Table */}
            <Card
                bordered={false}
                style={{
                    borderRadius: 8,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredCourses}
                    loading={isFetching}
                    rowKey="courseId"
                    pagination={{
                        pageSize: 10,
                        position: ["bottomCenter"],
                        showTotal: (total) => `Tổng ${total} khóa học`
                    }}
                    scroll={{ x: 1000 }}
                    virtual
                />
            </Card>

            {/* Delete Modal */}
            <Modal
                title={
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#1c1d1f" }}>
                        Xác nhận xóa khóa học
                    </span>
                }
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={cancelDelete}
                okText="Xác nhận xóa"
                cancelText="Hủy"
                okButtonProps={{
                    danger: true,
                    style: { fontWeight: 600 },
                }}
                cancelButtonProps={{
                    style: { fontWeight: 600 },
                }}
            >
                <p style={{ fontSize: 14, color: "#6a6f73", margin: "16px 0" }}>
                    Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.
                </p>
            </Modal>

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

export default memo(GetAllCourseTeacher);