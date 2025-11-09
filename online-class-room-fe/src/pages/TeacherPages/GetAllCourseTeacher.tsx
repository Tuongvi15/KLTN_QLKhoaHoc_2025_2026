import { Button, Input, Table, Tooltip, Modal, message, Pagination, Tag } from 'antd';
import { useState, useEffect } from 'react';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDeleteCourseMutation, useGetCoursesByTeacherQuery } from '../../services/course.services';
import { Course } from '../../types/Course.type';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';


const GetAllCourseTeacher = () => {
 const teacherId = useSelector((state: RootState) => state.user.id);
  const { data: courses, isFetching, refetch } = useGetCoursesByTeacherQuery(teacherId, { skip: !teacherId });  const [deleteCourse] = useDeleteCourseMutation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');

const filteredCourses = (courses?.filter((c: Course) =>
  c.title?.toLowerCase().includes(searchValue.toLowerCase())
) || []);


  const handleDelete = (courseId: number) => {
    setDeletingId(courseId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCourse(deletingId);
      message.success('Xóa khóa học thành công!');
      refetch();
    } catch {
      message.error('Xóa thất bại!');
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const cancelDelete = () => setDeleteModalVisible(false);

  const columns = [
    { title: 'Tên khóa học', dataIndex: 'title', key: 'title' },
    {
      title: 'Giá tiền',
      dataIndex: 'price',
      render: (price: number) => <span>{price?.toLocaleString()} đ</span>,
    },
    {
      title: 'Xuất bản',
      dataIndex: 'isPublic',
      render: (isPublic: boolean) =>
        isPublic ? <Tag color="green">Đã xuất bản</Tag> : <Tag color="red">Chưa xuất bản</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'courseIsActive',
      render: (active: boolean) =>
        active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Tạm ẩn</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Course) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Xem chi tiết">
            <Link to={`/teacher/viewCourseDetails/${record.courseId}`}>
              <Button type="link" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
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
        <Button type="primary" className="bg-blue-500">
          <Link to="/teacher/addCourse">Thêm khóa học mới</Link>
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
        rowKey={(r) => r.courseId!}
        pagination={false}
      />
      <Pagination className="flex justify-end mt-4" total={filteredCourses.length} />
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-blue-500 text-white' }}
      >
        <p>Bạn có chắc chắn muốn xóa khóa học này không?</p>
      </Modal>
    </div>
  );
};

export default GetAllCourseTeacher;
