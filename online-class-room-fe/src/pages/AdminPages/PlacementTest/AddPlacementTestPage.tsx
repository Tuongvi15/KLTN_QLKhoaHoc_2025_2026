import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, Button, message, Switch } from "antd";
import {
    useAddPlacementTestMutation,
    useUpdatePlacementTestMutation,
    useGetAllCategoriesQuery,
} from "../../../services/placementtest.services";
import PlacementQuestionManager from "./PlacementQuestionManager";

interface AddPlacementTestPageProps {
    test: any;
    onClose: () => void;
}

const AddPlacementTestPage = ({ test, onClose }: AddPlacementTestPageProps) => {
    const [form] = Form.useForm();

    // ✔ Lấy danh mục thay vì field
    const { data: categories } = useGetAllCategoriesQuery(undefined);

    const [addTest, { isLoading: isAdding }] = useAddPlacementTestMutation();
    const [updateTest, { isLoading: isUpdating }] = useUpdatePlacementTestMutation();

    const [showQuestions, setShowQuestions] = useState(false);

    const isEditMode = !!test?.placementTestId;
    const isActive = test?.isActive ?? false;

    // ✔ Load giá trị khi chỉnh sửa
    useEffect(() => {
        if (test) {
            form.setFieldsValue({
                title: test.title,
                description: test.description,
                categoryId: test.categoryId,
                isActive: test.isActive,
            });
        }
    }, [test, form]);

    // ✔ Submit
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
                        categoryId: values.categoryId,
                        title: values.title,
                        description: values.description,
                        isActive: values.isActive,
                    };

                await updateTest(payload).unwrap();
                message.success("Cập nhật bài test thành công!");
            } else {
                // ✔ Tạo payload đúng theo backend
                const payload = {
                    categoryId: values.categoryId,
                    title: values.title,
                    description: values.description,
                };

                const res = await addTest(payload).unwrap();

                const createdTest = res?.dataObject ?? res; // backend trả ResponeModel
                Object.assign(test, createdTest);

                message.success("Thêm bài test mới thành công!");
                setShowQuestions(true);
            }

            if (!showQuestions) onClose();
        } catch (err) {
            console.error(err);
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
                    {/* ✔ Danh mục */}
                    <Form.Item
                        label="Danh mục"
                        name="categoryId"
                        rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                        <Select placeholder="Chọn danh mục" disabled={isActive}>
                            {categories?.map((cat: any) => (
                                <Select.Option key={cat.catgoryId} value={cat.catgoryId}>
                                    {cat.name}
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
                        <Input placeholder="VD: Kiểm tra đầu vào lập trình" disabled={isActive} />
                    </Form.Item>

                    {/* Mô tả */}
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={4} placeholder="Nhập mô tả ngắn gọn..." />
                    </Form.Item>

                    {/* Trạng thái */}
                    {isEditMode && (
                        <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Chưa hoạt động" />
                        </Form.Item>
                    )}

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={onClose}>Hủy</Button>

                        {isEditMode && (
                            <Button type="dashed" onClick={() => setShowQuestions(true)} className="mr-auto">
                                Quản lý câu hỏi
                            </Button>
                        )}

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isAdding || isUpdating}
                            style={{
                                backgroundColor: "#1677FF",
                                borderColor: "#1677FF",
                                color: "#FFFFFF",
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
