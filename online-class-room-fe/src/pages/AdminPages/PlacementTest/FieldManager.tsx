import { useState } from "react";
import {
  useGetAllFieldsQuery,
  useAddFieldMutation,
  useDeleteFieldMutation,
} from "../../../services/placementtest.services";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Tag,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Field } from "../../../types/PlacementTest.type";

const FieldManager = () => {
  const { data: fields, refetch, isLoading } = useGetAllFieldsQuery(undefined);
  const [addField, { isLoading: isAdding }] = useAddFieldMutation();
  const [deleteField] = useDeleteFieldMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAddField = async () => {
    try {
      const values = await form.validateFields();
      await addField(values).unwrap();
      message.success("Thêm lĩnh vực thành công!");
      form.resetFields();
      setIsModalVisible(false);
      refetch();
    } catch {
      message.error("Thêm thất bại!");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteField(id).unwrap();
      message.success("Đã xóa lĩnh vực!");
      refetch();
    } catch {
      message.error("Xóa thất bại!");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "fieldId",
      width: 80,
    },
    {
      title: "Tên lĩnh vực",
      dataIndex: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (text?: string) => text || <i>Chưa có</i>,
    },
    {
      title: "Số bài test",
      render: (_: unknown, record: Field) => (
        <Tag color="blue">{record.placementTests?.length || 0}</Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: Field) => (
        <Popconfirm
          title="Xác nhận xóa?"
          description="Bạn có chắc muốn xóa lĩnh vực này?"
          okButtonProps={{ style: { backgroundColor: "#d32f2f" } }}
          onConfirm={() => handleDelete(record.fieldId)}
        >
          <Button danger size="small">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#1677ff]">
          Quản lý lĩnh vực
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
                        backgroundColor: '#1677FF',
                        borderColor: '#1677FF',
                        color: '#FFFFFF',
                    }}
          onClick={() => setIsModalVisible(true)}
        >
          Thêm lĩnh vực
        </Button>
      </div>

      <Table
        rowKey="fieldId"
        columns={columns}
        dataSource={fields || []}
        loading={isLoading}
        pagination={false}
      />

      <Modal
        open={isModalVisible}
        title="Thêm lĩnh vực mới"
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddField}
        confirmLoading={isAdding}
        okText="Thêm mới"
        cancelText="Hủy"
        okButtonProps={{
    // Nếu nó đã là type="primary" mà vẫn chìm, thêm style để ghi đè màu
    style: {
      backgroundColor: '#1890ff', // Ví dụ: Màu xanh dương mặc định của antd
      borderColor: '#1890ff',
      color: '#fff',
    },
  }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên lĩnh vực"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên lĩnh vực!" }]}
          >
            <Input placeholder="VD: Lập trình, Ngoại ngữ, Thiết kế..." />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              placeholder="Mô tả ngắn về lĩnh vực này (tùy chọn)"
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FieldManager;
