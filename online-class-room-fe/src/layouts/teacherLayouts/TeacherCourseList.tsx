import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

const TeacherCourseList: React.FC = () => {
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Course Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat: string) => <Tag color="blue">{cat}</Tag>,
        },
        {
            title: 'Students',
            dataIndex: 'students',
            key: 'students',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'green' : 'volcano'}>{status}</Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => navigate(`/teacher/courses/${record.key}`)}>
                        View
                    </Button>
                    <Button type="link" danger>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: '1',
            name: 'IELTS Foundation',
            category: 'English',
            students: 24,
            status: 'Active',
        },
        {
            key: '2',
            name: 'Grammar B1',
            category: 'English',
            students: 18,
            status: 'Active',
        },
        {
            key: '3',
            name: 'Writing Advanced',
            category: 'English',
            students: 10,
            status: 'Pending',
        },
    ];

    return (
        <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>My Courses</h2>
            <Button
                type="primary"
                style={{ marginBottom: 16 }}
                onClick={() => alert('Coming soon: Create new course')}
            >
                + Create Course
            </Button>
            <Table columns={columns} dataSource={data} bordered />
        </div>
    );
};

export default TeacherCourseList;
