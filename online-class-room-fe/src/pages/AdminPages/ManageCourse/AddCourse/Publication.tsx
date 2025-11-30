import React, { useState } from 'react';
import {
    Switch,
    Button,
    Modal,
    message,
    Tag,
    Input,
    Card,
    Space,
    Typography,
    Empty,
    Timeline
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { setCoursePublish } from '../../../../slices/courseSlice';

import {
    useGetApproveHistoryQuery,
    useApproveCourseMutation
} from '../../../../services/course.services';

import { RoleType } from '../../../../slices/authSlice';

import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    GlobalOutlined,
    PoweroffOutlined,
    CheckOutlined,
    CloseOutlined,
    HistoryOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const Publication: React.FC = () => {
    const dispatch = useDispatch();
    const courseCreatedData = useSelector(
        (state: RootState) => state.course.addCourse.courseCreatedData
    );
    const role = useSelector((state: RootState) => state.auth.currentRole);

    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectComment, setRejectComment] = useState("");

    // Modal & reason cho hủy xuất bản
    const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);
    const [unpublishReason, setUnpublishReason] = useState("");

    const { data: approveHistory = [], refetch: refetchApprove } =
        useGetApproveHistoryQuery(courseCreatedData.courseId);

    const [approveCourse, { isLoading: isApproving }] =
        useApproveCourseMutation();

    const latestApprove = approveHistory.length > 0 ? approveHistory[0] : null;

    const hasPending =
        latestApprove?.approveStatus === "Pending" &&
        latestApprove?.type === "DuyetKhoaHoc";

    const getApproveTypeLabel = (type: string) => {
        switch (type) {
            case "DuyetKhoaHoc":
                return "Duyệt khóa học";
            case "HuyXuatBan":
                return "Hủy xuất bản";
            default:
                return "Không xác định";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Approved":
                return <CheckCircleOutlined className="text-green-500" />;
            case "Rejected":
                return <CloseCircleOutlined className="text-red-500" />;
            case "Pending":
                return <ClockCircleOutlined className="text-orange-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "success";
            case "Rejected": return "error";
            case "Pending": return "warning";
            default: return "default";
        }
    };

    // ===============================
    // HỦY XUẤT BẢN (DUYỆT NGAY)
    // ===============================
    const handleUnpublish = async () => {
        if (!unpublishReason.trim()) {
            message.warning("Vui lòng nhập lý do hủy xuất bản");
            return;
        }

        try {
            // 1. Kiểm tra học viên còn học
            const check = await fetch(
                `https://qlkhtt-backend-production.up.railway.app/api/Course/CheckStudentStillLearning/${courseCreatedData.courseId}`
            ).then(r => r.json());

            if (check.hasStudent) {
                message.error("Không thể hủy xuất bản vì đang có học viên đang học.");
                return;
            }

            // 2. Gửi request unpublish (xử lý ngay)
            const user = localStorage.getItem("user");
            const token = user ? JSON.parse(user).accessToken : null;

            const res = await fetch(
                `https://qlkhtt-backend-production.up.railway.app/api/Course/RequestUnpublishCourse/${courseCreatedData.courseId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reason: unpublishReason
                    })
                }
            ).then(r => r.json());

            if (res.status !== "Success") {
                message.error(res.message || "Hủy xuất bản thất bại");
                return;
            }

            // 3. Update FE
            dispatch(setCoursePublish(false));

            message.success("Khóa học đã được hủy xuất bản thành công!");

            setUnpublishReason("");
            setUnpublishModalVisible(false);

            // 4. Reload lịch sử duyệt
            refetchApprove?.();

        } catch (err) {
            message.error("Hủy xuất bản thất bại.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Title level={2}>Xuất bản & Duyệt khóa học</Title>
                    <Text type="secondary">Quản lý trạng thái xuất bản và duyệt khóa học</Text>
                </div>

                <Space direction="vertical" size="large" className="w-full">

                    {/* ================== LỊCH SỬ DUYỆT =================== */}
                    {role === RoleType.ADMIN && (
                        <Card
                            title={
                                <Space>
                                    <HistoryOutlined className="text-blue-500" />
                                    <span>Lịch sử duyệt khóa học</span>
                                </Space>
                            }
                            className="shadow-sm"
                        >
                            {approveHistory.length === 0 ? (
                                <Empty description="Chưa có lịch sử duyệt" />
                            ) : (
                                <Timeline
                                    items={approveHistory.map((item: any) => ({
                                        dot: getStatusIcon(item.approveStatus),
                                        children: (
                                            <div className="pb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Tag color="blue">{getApproveTypeLabel(item.type)}</Tag>
                                                    <Tag color={getStatusColor(item.approveStatus)}>
                                                        {item.approveStatus === "Approved" && "Đã duyệt"}
                                                        {item.approveStatus === "Rejected" && "Từ chối"}
                                                        {item.approveStatus === "Pending" && "Đang chờ"}
                                                    </Tag>
                                                </div>

                                                {/* Ngày tạo phiếu */}
                                                <Text type="secondary" className="text-sm block">
                                                    <Text strong>Ngày tạo: </Text>
                                                    {item.createdAt
                                                        ? new Date(item.createdAt).toLocaleString("vi-VN")
                                                        : "Không có dữ liệu"}
                                                </Text>

                                                {/* Ngày duyệt phiếu */}
                                                <Text type="secondary" className="text-sm block mb-1">
                                                    <Text strong>Ngày duyệt: </Text>
                                                    {item.approveAt
                                                        ? new Date(item.approveAt).toLocaleString("vi-VN")
                                                        : "Chưa xử lý"}
                                                </Text>


                                                {item.reason && (
                                                    <Paragraph className="text-sm bg-gray-50 p-3 rounded">
                                                        <Text strong>Lý do: </Text>{item.reason}
                                                    </Paragraph>
                                                )}
                                            </div>
                                        ),
                                    }))}
                                />
                            )}

                            {/* Nút duyệt cho pending */}
                            {hasPending && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            loading={isApproving}
                                            style={{
                                                backgroundColor: hasPending ? "#ffd666" : "#0c5ecf",
                                                borderColor: hasPending ? "#ffa940" : "#0c5ecf",
                                                color: hasPending ? "#000" : "#fff",
                                                opacity: 1, // đảm bảo không bị mờ
                                            }}
                                            onClick={async () => {
                                                try {
                                                    await approveCourse({
                                                        approveCourseId: latestApprove.approveCourseId,
                                                        isApproved: true
                                                    }).unwrap();

                                                    dispatch(setCoursePublish(true));
                                                    message.success("Đã duyệt khóa học!");
                                                    refetchApprove?.();
                                                } catch {
                                                    message.error("Duyệt thất bại!");
                                                }
                                            }}
                                        >
                                            Duyệt khóa học
                                        </Button>

                                        <Button danger icon={<CloseOutlined />}
                                            onClick={() => setRejectModalVisible(true)}>
                                            Từ chối
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* ================= XUẤT BẢN KHÓA HỌC ================= */}
                    {role === RoleType.ADMIN && (
                        <Card className="shadow-sm">
                            <div className="flex items-center justify-between">
                                <Space size="large">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${courseCreatedData.isPublic ? "bg-green-100" : "bg-gray-100"
                                        }`}>
                                        <GlobalOutlined className={`text-2xl ${courseCreatedData.isPublic ? "text-green-600" : "text-gray-400"
                                            }`} />
                                    </div>

                                    <div>
                                        <Title level={5}>Xuất bản khóa học</Title>
                                        <Text type="secondary">
                                            {courseCreatedData.isPublic
                                                ? "Khóa học đang được công khai"
                                                : "Khóa học chưa được xuất bản"}
                                        </Text>
                                    </div>
                                </Space>

                                <div className="flex flex-col items-end gap-2">
                                    <Switch checked={courseCreatedData.isPublic} disabled />

                                    <Text type="secondary" className="text-xs">
                                        {courseCreatedData.isPublic ? "Đã xuất bản" : "Chưa xuất bản"}
                                    </Text>

                                    {/* NÚT HỦY XUẤT BẢN */}
                                    {courseCreatedData.isPublic && (
                                        <Button
                                            danger
                                            size="small"
                                            onClick={() => setUnpublishModalVisible(true)}
                                        >
                                            Hủy xuất bản
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* =================== TRẠNG THÁI KHÓA HỌC ================= */}
                    {role === RoleType.ADMIN && (
                        <Card className="shadow-sm">
                            <div className="flex items-center justify-between">
                                <Space size="large">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${courseCreatedData.courseIsActive ? "bg-blue-100" : "bg-gray-100"
                                        }`}>
                                        <PoweroffOutlined className={`text-2xl ${courseCreatedData.courseIsActive ? "text-blue-600" : "text-gray-400"
                                            }`} />
                                    </div>

                                    <div>
                                        <Title level={5}>Trạng thái hoạt động</Title>
                                        <Text type="secondary">
                                            {courseCreatedData.courseIsActive
                                                ? "Khóa học đang hoạt động"
                                                : "Khóa học đã tạm dừng"}
                                        </Text>
                                    </div>
                                </Space>

                                <Switch checked={courseCreatedData.courseIsActive} disabled />
                            </div>
                        </Card>
                    )}
                </Space>

                {/* =================== MODAL HỦY XUẤT BẢN =================== */}
                <Modal
                    title="Xác nhận hủy xuất bản khóa học"
                    open={unpublishModalVisible}
                    onCancel={() => {
                        setUnpublishModalVisible(false);
                        setUnpublishReason("");
                    }}
                    onOk={handleUnpublish}
                    okText="Xác nhận"
                    okButtonProps={{ danger: true }}
                >
                    <Text strong className="block mb-2">
                        Lý do hủy xuất bản: <Text type="danger">*</Text>
                    </Text>

                    <Input.TextArea
                        rows={4}
                        value={unpublishReason}
                        onChange={(e) => setUnpublishReason(e.target.value)}
                        placeholder="Nhập lý do hủy xuất bản khóa học..."
                        maxLength={500}
                        showCount
                    />

                    <Text type="secondary" className="text-xs block mt-1">
                        Lý do này sẽ được ghi vào lịch sử duyệt khóa học.
                    </Text>
                </Modal>

                {/* =================== MODAL TỪ CHỐI =================== */}
                <Modal
                    title="Từ chối yêu cầu duyệt"
                    open={rejectModalVisible}
                    onCancel={() => setRejectModalVisible(false)}
                    onOk={async () => {
                        try {
                            await approveCourse({
                                approveCourseId: latestApprove.approveCourseId,
                                isApproved: false,
                                comment: rejectComment
                            }).unwrap();

                            setRejectComment("");
                            message.success("Đã từ chối yêu cầu");
                            refetchApprove?.();
                        } catch {
                            message.error("Từ chối thất bại");
                        }
                        setRejectModalVisible(false);
                    }}
                    okButtonProps={{ danger: true }}
                >
                    <Text strong>Lý do từ chối:</Text>
                    <Input.TextArea
                        rows={4}
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                    />
                </Modal>

            </div>
        </div>
    );
};

export default Publication;
