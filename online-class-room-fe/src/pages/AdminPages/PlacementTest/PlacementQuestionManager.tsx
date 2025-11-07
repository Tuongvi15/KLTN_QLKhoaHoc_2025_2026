import { useState } from "react";
import { Button, Table, Form, Input, Select, message, Drawer } from "antd";
import {
  useGetQuestionsByTestIdQuery,
  useAddPlacementQuestionMutation,
} from "../../../services/placementtest.services";

interface PlacementQuestionManagerProps {
  testId: number;
  onBack: () => void;
}

const PlacementQuestionManager = ({ testId, onBack }: PlacementQuestionManagerProps) => {
  const { data: questions, refetch } = useGetQuestionsByTestIdQuery(testId);
  const [addQuestion] = useAddPlacementQuestionMutation();
  const [openAdd, setOpenAdd] = useState(false);
  const [form] = Form.useForm();

  const handleAddQuestion = async (values: any) => {
    try {
      await addQuestion({
        placementTestId: testId,
        ...values,
      }).unwrap();
      message.success("Đã thêm câu hỏi mới!");
      setOpenAdd(false);
      form.resetFields();
      refetch();
    } catch {
      message.error("Lỗi khi thêm câu hỏi!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "questionId", width: 70 },
    { title: "Câu hỏi", dataIndex: "questionText" },
    { title: "Mức độ", dataIndex: "difficultyLevel" },
    { title: "Đáp án đúng", dataIndex: "correctAnswer" },
  ];

  return (
    <div>
      <div className="flex justify-between mb-3">
        <Button onClick={onBack}>⬅ Quay lại</Button>
        <Button type="primary" onClick={() => setOpenAdd(true)}>
          + Thêm câu hỏi
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={questions || []}
        rowKey="questionId"
        pagination={{ pageSize: 5 }}
      />

      {/* Drawer thêm câu hỏi */}
      <Drawer
        title="Thêm câu hỏi mới"
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        width={500}
      >
        <Form layout="vertical" form={form} onFinish={handleAddQuestion}>
          <Form.Item
            label="Nội dung câu hỏi"
            name="questionText"
            rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Các lựa chọn (A/B/C/D)"
            name="answerOptions"
            rules={[{ required: true, message: "Nhập đáp án" }]}
          >
            <Input placeholder="Ví dụ: A.Java|B.Python|C.C#|D.PHP" />
          </Form.Item>

          <Form.Item
            label="Đáp án đúng"
            name="correctAnswer"
            rules={[{ required: true, message: "Chọn đáp án đúng" }]}
          >
            <Select placeholder="Chọn đáp án">
              <Select.Option value="A">A</Select.Option>
              <Select.Option value="B">B</Select.Option>
              <Select.Option value="C">C</Select.Option>
              <Select.Option value="D">D</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mức độ"
            name="difficultyLevel"
            rules={[{ required: true, message: "Chọn mức độ" }]}
          >
            <Select placeholder="Chọn độ khó">
              <Select.Option value={1}>Dễ</Select.Option>
              <Select.Option value={2}>Trung bình</Select.Option>
              <Select.Option value={3}>Khó</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end">
            <Button onClick={() => setOpenAdd(false)} className="mr-2">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Thêm
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default PlacementQuestionManager;
