import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, message, Switch } from "antd";
import {
    useAddPlacementTestMutation,
    useUpdatePlacementTestMutation,
    useGetAllFieldsQuery,
} from "../../../services/placementtest.services";
import PlacementQuestionManager from "./PlacementQuestionManager";

interface AddPlacementTestPageProps {
    test: any;
    onClose: () => void;
}

const AddPlacementTestPage = ({ test, onClose }: AddPlacementTestPageProps) => {
    const [form] = Form.useForm();

    const { data: fields } = useGetAllFieldsQuery(undefined);
    const [addTest, { isLoading: isAdding }] = useAddPlacementTestMutation();
    const [updateTest, { isLoading: isUpdating }] = useUpdatePlacementTestMutation();

    const [showQuestions, setShowQuestions] = useState(false);

    const isEditMode = !!test?.placementTestId;
    const isActive = test?.isActive ?? false;

    // ✅ Gán giá trị khi mở Drawer
    useEffect(() => {
        if (test) {
            form.setFieldsValue({
                title: test.title,
                description: test.description,
                fieldId: test.field?.fieldId || test.fieldId,
                isActive: test.isActive,
            });
        }
    }, [test, form]);

    // ✅ Submit
    const handleSubmit = async (values: any) => {
        try {
            if (isEditMode) {
                // Nếu đang active => chỉ cho phép update isActive + description
                const payload = isActive
                    ? {
                        placementTestId: test.placementTestId,
                        isActive: values.isActive,
                        description: values.description,
                    }
                    : {
                        placementTestId: test.placementTestId,
                        fieldId: values.fieldId,
                        title: values.title,
                        description: values.description,
                        isActive: values.isActive,
                    };

                await updateTest(payload).unwrap();
                message.success("Cập nhật bài test thành công!");
            } else {
                const res = await addTest(values).unwrap();
                message.success("Thêm bài test mới thành công!");
                Object.assign(test, res);
                setShowQuestions(true);
            }

            if (!showQuestions) onClose();
        } catch (err) {
            message.error("Thao tác thất bại!");
        }
    };

    return (
        <Drawer
            open={!!test}
            onClose={onClose}
            title={isEditMode ? "Chỉnh sửa bài test" : "Thêm bài test mới"}
            width={600}
        >
            {!showQuestions ? (
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                    initialValues={{
                        isActive: false,
                    }}
                >
                    {/* Lĩnh vực */}
                    <Form.Item
                        label="Lĩnh vực"
                        name="fieldId"
                        rules={[{ required: true, message: "Vui lòng chọn lĩnh vực" }]}
                    >
                        <Select placeholder="Chọn lĩnh vực" disabled={isActive}>
                            {fields?.map((field: any) => (
                                <Select.Option key={field.fieldId} value={field.fieldId}>
                                    {field.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Tiêu đề */}
                    <Form.Item
                        label="Tiêu đề bài test"
                        name="title"
                        rules={[{ required: true, message: "Nhập tiêu đề bài test!" }]}
                    >
                        <Input
                            placeholder="VD: Kiểm tra đầu vào lập trình cơ bản"
                            disabled={isActive}
                        />
                    </Form.Item>

                    {/* Mô tả (luôn có thể sửa) */}
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập mô tả ngắn gọn..."
                            disabled={false}
                        />
                    </Form.Item>

                    {/* Trạng thái */}
                    {isEditMode && (
                        <Form.Item
                            label="Trạng thái"
                            name="isActive"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Hoạt động"
                                unCheckedChildren="Chưa hoạt động"
                            />
                        </Form.Item>
                    )}

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={onClose}>Hủy</Button>

                        {test?.placementTestId && (
                            <Button
                                type="dashed"
                                onClick={() => setShowQuestions(true)}
                                className="mr-auto"
                            >
                                Quản lý câu hỏi
                            </Button>
                        )}

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isAdding || isUpdating}
                            style={{
                                backgroundColor: '#1677FF', // Thay bằng màu xanh dương đậm hoặc màu bạn muốn
                                borderColor: '#1677FF',
                                color: '#FFFFFF', // Đảm bảo màu chữ là trắng (hoặc màu sáng)
                            }}
                        >
                            {isEditMode ? "Lưu thay đổi" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            ) : (
                <PlacementQuestionManager
                    testId={test.placementTestId}
                    onBack={() => setShowQuestions(false)}
                />
            )}
        </Drawer>
    );
};

export default AddPlacementTestPage;
