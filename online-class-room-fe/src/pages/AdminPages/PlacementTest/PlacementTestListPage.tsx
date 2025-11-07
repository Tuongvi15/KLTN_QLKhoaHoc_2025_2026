import { useState } from "react";
import { Button, Table, Space, Tag, Popconfirm, message, Modal } from "antd";
import {
    useGetAllPlacementTestsQuery,
    useDeletePlacementTestMutation,
} from "../../../services/placementtest.services";
import { PlacementTest } from "../../../types/PlacementTest.type";
import AddPlacementTestPage from "./AddPlacementTestPage";
import PlacementQuestionManager from "./PlacementQuestionManager";

const PlacementTestListPage = () => {
    const { data: tests, isLoading, refetch } = useGetAllPlacementTestsQuery(undefined);
    const [deleteTest] = useDeletePlacementTestMutation();

    const [selectedTest, setSelectedTest] = useState<PlacementTest | null>(null);
    const [questionModalTest, setQuestionModalTest] = useState<PlacementTest | null>(null);

    const handleDelete = async (id: number) => {
        try {
            await deleteTest(id).unwrap();
            message.success("Đã xóa bài test!");
            refetch();
        } catch (error) {
            message.error("Xóa thất bại");
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "placementTestId",
            width: 80,
        },
        {
            title: "Lĩnh vực",
            dataIndex: "fieldName",
            render: (name: string) => name || <i>Không xác định</i>,
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            render: (title: string) => <b>{title}</b>,
        },
        {
            title: "Số câu hỏi",
            render: (_: unknown, record: PlacementTest) =>
                record.placementQuestions?.length ?? 0,
        },
        {
            title: "Trạng thái",
            render: (_: unknown, record: PlacementTest) =>
                record.isActive ? (
                    <Tag color="green">Hoạt động</Tag>
                ) : (
                    <Tag color="default">Chưa hoạt động</Tag>
                ),
        },
        {
            title: "Hành động",
            render: (_: unknown, record: PlacementTest) => (
                <Space>
                    {/* ✅ Nút Sửa: luôn hiển thị, nhưng kiểm tra quyền khi mở popup */}
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => setSelectedTest(record)}
                        style={{ backgroundColor: "#1677FF", borderColor: "#1677FF" }}
                    >
                        Sửa
                    </Button>

                    {/* ✅ Nút thêm hoặc chỉnh sửa câu hỏi */}
                    <Button
                        size="small"
                        type="default"
                        onClick={() => setQuestionModalTest(record)}
                    >
                        {record.placementQuestions?.length
                            ? "Chỉnh sửa câu hỏi"
                            : "Thêm câu hỏi"}
                    </Button>

                    {/* ✅ Nút Xóa: chỉ hiện khi chưa hoạt động */}
                    {!record.isActive && (
                        <Popconfirm
                            title="Xóa bài test?"
                            description="Bạn có chắc muốn xóa bài test này?"
                            okButtonProps={{ style: { background: "#d32f2f" } }}
                            onConfirm={() => handleDelete(record.placementTestId)}
                        >
                            <Button danger size="small">
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },


    ];

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1677ff]">
                    Quản lý bài test đầu vào
                </h2>
                <Button type="primary" onClick={() => setSelectedTest({} as PlacementTest)} style={{
                    backgroundColor: '#1677FF', // Thay bằng màu xanh dương đậm hoặc màu bạn muốn
                    borderColor: '#1677FF',
                    color: '#FFFFFF', // Đảm bảo màu chữ là trắng (hoặc màu sáng)
                }}>
                    + Thêm bài test
                </Button>
            </div>

            <Table<PlacementTest>
                columns={columns}
                dataSource={tests || []}
                loading={isLoading}
                rowKey="placementTestId"
                pagination={{ pageSize: 10 }}
            />

            {/* Drawer thêm/sửa bài test */}
            {selectedTest && (
                <AddPlacementTestPage
                    test={selectedTest}
                    onClose={() => {
                        setSelectedTest(null);
                        refetch();
                    }}
                />
            )}

            {/* Modal lớn để thêm/chỉnh sửa câu hỏi */}
            <Modal
                open={!!questionModalTest}
                title={
                    questionModalTest?.placementQuestions?.length
                        ? `Chỉnh sửa câu hỏi - ${questionModalTest?.title}`
                        : `Thêm câu hỏi - ${questionModalTest?.title}`
                }
                footer={null}
                width={1000}
                onCancel={() => setQuestionModalTest(null)}
                destroyOnClose
            >
                {questionModalTest && (
                    <PlacementQuestionManager
                        testId={questionModalTest.placementTestId}
                        onBack={() => setQuestionModalTest(null)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PlacementTestListPage;
