import { useState } from "react";
import { Table, Button, Tag, Modal, Spin, message } from "antd";
import {
    useGetPendingTeachersQuery,
    useApproveTeacherMutation,
} from "../../../services/account.services";

const ApproveTeacherPage = () => {
    const { data: list, isLoading, refetch } = useGetPendingTeachersQuery();
    const [approveTeacher] = useApproveTeacherMutation();

    // ⭐ Modal Preview CV
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");

    // ⭐ Modal Duyệt
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const openPreview = (url: string) => {
        setPreviewUrl(url);
        setPreviewOpen(true);
    };

    const openApproveModal = (id: string) => {
        setSelectedId(id);
        setConfirmApproveOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedId) return;

        try {
            await approveTeacher({ accountId: selectedId, status: "Active" }).unwrap();
            message.success("Đã duyệt giảng viên!");
            setConfirmApproveOpen(false);
            refetch();
        } catch {
            message.error("Lỗi khi duyệt giảng viên!");
        }
    };

    const columns = [
        {
            title: "Tên",
            render: (_: any, r: any) => r.firstName + " " + r.lastName,
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "CV",
            render: (_: any, r: any) =>
                r.cvUrl ? (
                    <Button
                        type="link"
                        onClick={() => openPreview(r.cvUrl)}
                        style={{ padding: 0 }}
                    >
                        Xem CV
                    </Button>
                ) : (
                    <Tag color="red">Chưa upload</Tag>
                ),
        },
        {
            title: "Trạng thái",
            render: () => <Tag color="orange">Đang chờ duyệt</Tag>,
        },
        {
            title: "Hành động",
            render: (_: any, r: any) => (
                <Button
                    type="primary"
                    onClick={() => openApproveModal(r.id)}
                >
                    Duyệt
                </Button>
            ),
        },
    ];

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4 font-bold text-[#1677ff]">
                Duyệt tài khoản giảng viên
            </h2>

            <Table
                rowKey="id"
                dataSource={list || []}
                loading={isLoading}
                columns={columns}
                pagination={false}
            />

            {/* ⭐ Modal Preview CV PDF */}
            <Modal
                open={previewOpen}
                title="Xem CV Giảng Viên"
                footer={null}
                width={900}
                onCancel={() => setPreviewOpen(false)}
            >
                {!previewUrl ? (
                    <div className="py-10 text-center">
                        <Spin />
                    </div>
                ) : (
                    <iframe
                        src={previewUrl}
                        style={{ width: "100%", height: "80vh", borderRadius: 10 }}
                        title="CV Preview"
                    />
                )}
            </Modal>

            {/* ⭐ Modal xác nhận duyệt */}
            <Modal
                open={confirmApproveOpen}
                title="Xác nhận duyệt giảng viên"
                onCancel={() => setConfirmApproveOpen(false)}
                onOk={handleApprove}
                okText="Duyệt"
                okButtonProps={{ className: "bg-blue-600 text-white" }}
                cancelText="Hủy"
            >
                <p>Bạn có chắc chắn muốn duyệt tài khoản giảng viên này?</p>
            </Modal>
        </div>
    );
};

export default ApproveTeacherPage;
