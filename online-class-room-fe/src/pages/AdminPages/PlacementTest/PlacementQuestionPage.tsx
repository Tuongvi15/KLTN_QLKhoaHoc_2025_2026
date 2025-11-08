import { useParams, useNavigate } from "react-router-dom";
import {
    Button,
    Table,
    Tag,
    Form,
    Input,
    Select,
    message,
    Modal,
    Space,
    Card,
    Radio,
    Upload,
    Typography,
    Popconfirm,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";

import { UploadOutlined, PlusOutlined, EditOutlined, SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
    useGetQuestionsByTestIdQuery,
    useAddPlacementQuestionMutation,
    useDeletePlacementQuestionMutation,
    useUpdatePlacementQuestionMutation,
} from "../../../services/placementtest.services";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "../../../firebase/firebase";

const { Title } = Typography;

const PlacementQuestionPage = () => {
    const { id } = useParams<{ id: string }>();
    const testId = Number(id);
    const navigate = useNavigate();
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState<number | null>(null);

    const [isRemoveImage, setIsRemoveImage] = useState(false);
    const { data: questions, refetch, isLoading } =
        useGetQuestionsByTestIdQuery(testId);

    const [addQuestion] = useAddPlacementQuestionMutation();
    const [updateQuestion] = useUpdatePlacementQuestionMutation();
    const [deleteQuestion] = useDeletePlacementQuestionMutation();

    const [form] = Form.useForm();

    // ✅ Local states
    const [correctAnswer, setCorrectAnswer] = useState<string>("A");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

    // ✅ Handle ADD / UPDATE logic
    const handleSubmit = async (values: any) => {
        try {
            let uploadedImageUrl = imageUrl;

            // Nếu có file ảnh mới → upload lại
            if (imageFile) {
                const storageRef = ref(
                    firebaseStorage,
                    `placement_questions/${Date.now()}_${imageFile.name}`
                );
                await uploadBytes(storageRef, imageFile);
                uploadedImageUrl = await getDownloadURL(storageRef);
            }

            const options = [
                `A.${values.optionA}`,
                `B.${values.optionB}`,
                `C.${values.optionC}`,
                `D.${values.optionD}`,
            ].join("|");

            if (editingQuestion) {
                // ✅ UPDATE mode
                await updateQuestion({
                    questionId: editingQuestion.questionId,
                    placementTestId: testId,
                    questionText: values.questionText,
                    answerOptions: options,
                    correctAnswer,
                    difficultyLevel: values.difficultyLevel,
                    imageUrl: isRemoveImage
                        ? "" // ✅ nếu người dùng xóa ảnh → gửi chuỗi rỗng
                        : uploadedImageUrl || imageUrl || "",
                }).unwrap();

                message.success("Cập nhật câu hỏi thành công!");
                setIsRemoveImage(false);

            } else {
                // ✅ ADD mode
                await addQuestion({
                    placementTestId: testId,
                    questionText: values.questionText,
                    answerOptions: options,
                    correctAnswer,
                    difficultyLevel: values.difficultyLevel,
                    imageUrl: uploadedImageUrl || undefined,
                }).unwrap();
                message.success("Thêm câu hỏi thành công!");
            }

            form.resetFields();
            setImageFile(null);
            setImageUrl("");
            setCorrectAnswer("A");
            setEditingQuestion(null);
            refetch();
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lưu câu hỏi!");
        }
    };

    // ✅ Handle DELETE
    const handleDelete = async (id: number) => {
        try {
            await deleteQuestion(id).unwrap();
            message.success("Đã xóa câu hỏi!");
            refetch();
        } catch {
            message.error("Xóa thất bại!");
        }
    };

    // ✅ Load question to edit
    const handleEdit = (record: any) => {
        const options = record.answerOptions?.split("|") || [];
        const optionMap: Record<string, string> = {};
        options.forEach((opt: string) => {
            const [key, value] = opt.split(".");
            optionMap[key] = value;
        });

        form.setFieldsValue({
            questionText: record.questionText,
            optionA: optionMap["A"],
            optionB: optionMap["B"],
            optionC: optionMap["C"],
            optionD: optionMap["D"],
            difficultyLevel: record.difficultyLevel,
        });

        setCorrectAnswer(record.correctAnswer);
        setImageUrl(record.imageUrl || "");
        setEditingQuestion(record);
        message.info("Đang chỉnh sửa câu hỏi...");
    };

    // ✅ Table columns
    const columns = [
        { title: "ID", dataIndex: "questionId", width: 60 },
        {
            title: "Ảnh",
            dataIndex: "imageUrl",
            render: (url: string) =>
                url ? (
                    <img
                        src={url}
                        alt="Câu hỏi"
                        style={{
                            width: 70,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                        }}
                    />
                ) : (
                    <i>Không có</i>
                ),
        },
        { title: "Câu hỏi", dataIndex: "questionText", ellipsis: true },
        {
            title: "Mức độ",
            dataIndex: "difficultyLevel",
            render: (level: number) =>
                level === 1 ? "Dễ" : level === 2 ? "Trung bình" : "Khó",
        },
        { title: "Đáp án đúng", dataIndex: "correctAnswer" },
        {
            title: "Thao tác",
            render: (_: unknown, record: any) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title="Xóa câu hỏi?"
                        onConfirm={() => handleDelete(record.questionId)}
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!mb-0 !text-[#1677ff]">
                    Quản lý câu hỏi - Bài test #{testId}
                </Title>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    type="default"
                >
                    Quay lại danh sách bài test
                </Button>
            </div>

            {/* Form thêm/sửa câu hỏi */}
            <Card
                title={
                    <span className="font-semibold text-[#1677ff]">
                        {editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
                    </span>
                }
                className="shadow-md mb-8"
            >
                <Form layout="vertical" form={form} onFinish={handleSubmit}>
                    {/* Câu hỏi */}
                    <Form.Item
                        label="Nội dung câu hỏi"
                        name="questionText"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung câu hỏi" }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập nội dung câu hỏi..." />
                    </Form.Item>

                    {/* Ảnh */}
                    {/* Ảnh minh họa (tùy chọn) */}
                    <Form.Item label="Ảnh minh họa (tùy chọn)">
                        {imageUrl ? (
                            <div className="flex flex-col items-start gap-3 mt-2">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-h-56 rounded-md border border-gray-300 shadow-sm"
                                />
                                <div className="flex gap-3">
                                    <Button
                                        danger
                                        size="small"
                                        onClick={() => {
                                            setImageUrl("");
                                            setImageFile(null);
                                            setIsRemoveImage(true);
                                            message.info("Ảnh đã được xoá, nhấn Lưu để cập nhật thay đổi.");
                                        }}
                                    >
                                        🗑 Xóa ảnh
                                    </Button>

                                    <Upload
                                        beforeUpload={(file) => {
                                            setImageFile(file);
                                            setImageUrl(URL.createObjectURL(file));
                                            return false;
                                        }}
                                        showUploadList={false}
                                    >
                                        <Button size="small" icon={<UploadOutlined />}>
                                            Đổi ảnh
                                        </Button>
                                    </Upload>
                                </div>
                            </div>
                        ) : (
                            <Upload
                                beforeUpload={(file) => {
                                    setImageFile(file);
                                    setImageUrl(URL.createObjectURL(file));
                                    return false;
                                }}
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                            </Upload>
                        )}
                    </Form.Item>


                    {/* Đáp án */}
                    <Card size="small" title="Các lựa chọn (A, B, C, D)">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["A", "B", "C", "D"].map((opt) => (
                                <Card key={opt} size="small" className="shadow-sm">
                                    <Form.Item
                                        label={`Đáp án ${opt}`}
                                        name={`option${opt}`}
                                        rules={[{ required: true, message: `Nhập đáp án ${opt}` }]}
                                    >
                                        <Input placeholder={`Nhập nội dung đáp án ${opt}`} />
                                    </Form.Item>
                                    <Radio
                                        checked={correctAnswer === opt}
                                        onChange={() => setCorrectAnswer(opt)}
                                    >
                                        Đáp án đúng
                                    </Radio>
                                </Card>
                            ))}
                        </div>
                    </Card>

                    {/* Mức độ */}
                    <Form.Item
                        label="Mức độ câu hỏi"
                        name="difficultyLevel"
                        className="mt-6"
                        rules={[{ required: true, message: "Chọn mức độ câu hỏi" }]}
                    >
                        <Select placeholder="Chọn độ khó">
                            <Select.Option value={1}>Dễ</Select.Option>
                            <Select.Option value={2}>Trung bình</Select.Option>
                            <Select.Option value={3}>Khó</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Buttons */}
                    <div className="text-right mt-4 space-x-3">
                        {editingQuestion && (
                            <Button onClick={() => {
                                form.resetFields();
                                setEditingQuestion(null);
                                setImageUrl("");
                                setImageFile(null);
                                setCorrectAnswer("A");
                            }}>
                                Hủy
                            </Button>
                        )}
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={editingQuestion ? <SaveOutlined /> : <PlusOutlined />}
                            style={{ backgroundColor: "#1677FF", borderColor: "#1677FF" }}
                        >
                            {editingQuestion ? "Lưu thay đổi" : "Thêm câu hỏi"}
                        </Button>
                    </div>
                </Form>
            </Card>

            {/* Table danh sách câu hỏi */}
            {/* Table danh sách câu hỏi */}
            <Card
                className="shadow-sm"
                title={
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#1677ff] text-base">
                                Danh sách câu hỏi
                            </span>
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => setIsPreviewVisible(true)}
                            >
                                Xem toàn bộ
                            </Button>
                        </div>


                        {/* ✅ Tổng hợp theo mức độ */}
                        <div className="flex gap-4 text-sm text-gray-600">
                            <span className="font-medium">
                                Dễ:{" "}
                                <span className="text-green-600 font-semibold">
                                    {questions?.filter((q) => q.difficultyLevel === 1).length || 0}
                                </span>
                            </span>
                            <span className="font-medium">
                                Trung bình:{" "}
                                <span className="text-orange-500 font-semibold">
                                    {questions?.filter((q) => q.difficultyLevel === 2).length || 0}
                                </span>
                            </span>
                            <span className="font-medium">
                                Khó:{" "}
                                <span className="text-red-500 font-semibold">
                                    {questions?.filter((q) => q.difficultyLevel === 3).length || 0}
                                </span>
                            </span>
                            <span className="font-medium text-gray-800">
                                Tổng:{" "}
                                <span className="text-[#1677ff] font-bold">
                                    {questions?.length || 0}
                                </span>
                            </span>
                        </div>
                    </div>
                }
            >
                <Table
                    columns={[
                        {
                            title: "STT",
                            render: (_: any, __: any, index: number) => index + 1,
                            width: 70,
                            align: "center",
                        },
                        {
                            title: "Ảnh",
                            dataIndex: "imageUrl",
                            render: (url: string) =>
                                url ? (
                                    <img
                                        src={url}
                                        alt="Câu hỏi"
                                        style={{
                                            width: 70,
                                            height: 60,
                                            objectFit: "cover",
                                            borderRadius: 6,
                                            border: "1px solid #ddd",
                                        }}
                                    />
                                ) : (
                                    <i>Không có</i>
                                ),
                        },
                        {
                            title: "Nội dung câu hỏi",
                            dataIndex: "questionText",
                            render: (text: string) => (
                                <span className="text-gray-800">{text}</span>
                            ),
                        },
                        {
                            title: "Mức độ",
                            dataIndex: "difficultyLevel",
                            align: "center",
                            render: (level: number) => {
                                if (level === 1)
                                    return <Tag color="green">Dễ</Tag>;
                                if (level === 2)
                                    return <Tag color="orange">Trung bình</Tag>;
                                return <Tag color="red">Khó</Tag>;
                            },
                        },

                        {
                            title: "Thao tác",
                            align: "center",
                            render: (_: unknown, record: any, index: number) => (
                                <Space>
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => handleEdit(record)}
                                        icon={<EditOutlined />}
                                    >
                                        Sửa
                                    </Button>

                                    <Popconfirm
                                        title="Xóa câu hỏi?"
                                        onConfirm={() => handleDelete(record.questionId)}
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button type="link" danger size="small">
                                            Xóa
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                    dataSource={questions || []}
                    loading={isLoading}
                    rowKey="questionId"
                    pagination={{ pageSize: 8 }}
                />
            </Card>
            <Modal
                title={<span className="font-semibold text-[#1677ff]">Danh sách câu hỏi chi tiết</span>}
                open={isPreviewVisible}
                onCancel={() => setIsPreviewVisible(false)}
                footer={null}
                width={1000}
                style={{ top: 40 }}
                bodyStyle={{ maxHeight: "80vh", overflowY: "auto", background: "#fafafa" }}
            >
                {/* Bộ lọc */}
                <div className="flex flex-wrap gap-3 mb-5 items-center">
                    <Input.Search
                        placeholder="Tìm câu hỏi..."
                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                        className="w-[250px]"
                    />
                    <Select
                        placeholder="Lọc theo mức độ"
                        allowClear
                        value={filterLevel ?? undefined}
                        onChange={(value) => setFilterLevel(value ?? null)}
                        style={{ width: 180 }}
                    >
                        <Select.Option value={1}>Dễ</Select.Option>
                        <Select.Option value={2}>Trung bình</Select.Option>
                        <Select.Option value={3}>Khó</Select.Option>
                    </Select>
                </div>

                {/* Danh sách câu hỏi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(questions || [])
                        .filter(
                            (q) =>
                                q.questionText.toLowerCase().includes(searchTerm) &&
                                (filterLevel ? q.difficultyLevel === filterLevel : true)
                        )
                        .map((q, index) => {
                            const options = q.answerOptions?.split("|") || [];
                            return (
                                <Card
                                    key={q.questionId}
                                    title={
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">
                                                Câu {index + 1}
                                            </span>
                                            {q.difficultyLevel === 1 ? (
                                                <Tag color="green">Dễ</Tag>
                                            ) : q.difficultyLevel === 2 ? (
                                                <Tag color="orange">Trung bình</Tag>
                                            ) : (
                                                <Tag color="red">Khó</Tag>
                                            )}
                                        </div>
                                    }
                                    className="shadow-sm border border-gray-200 hover:shadow-md transition"
                                >
                                    {q.imageUrl && (
                                        <img
                                            src={q.imageUrl}
                                            alt="preview"
                                            className="rounded-md mb-3 max-h-48 w-full object-cover border border-gray-200"
                                        />
                                    )}
                                    <p className="font-medium text-gray-800 mb-2">{q.questionText}</p>
                                    <div className="flex flex-col gap-1">
                                        {options.map((opt: string) => {
                                            const [label, text] = opt.split(".");
                                            const isCorrect = label === q.correctAnswer;
                                            return (
                                                <div
                                                    key={label}
                                                    className={`p-2 rounded-md border text-sm ${isCorrect
                                                            ? "bg-green-50 border-green-400 text-green-700 font-semibold"
                                                            : "bg-white border-gray-200"
                                                        }`}
                                                >
                                                    <b>{label}.</b> {text}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            );
                        })}
                </div>
            </Modal>

        </div>
    );
};

export default PlacementQuestionPage;
