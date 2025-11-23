import { Input, Button, Tag, message, Card, Space, Typography } from "antd";
import {
    BookOutlined,
    TagsOutlined,
    TrophyOutlined,
    BulbOutlined,
    PlusOutlined
} from '@ant-design/icons';

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    setCourseCreatedData,
    setCourseKnowledge,
    updateCourseCategory,
    CouseMode
} from "../../../slices/courseSlice";

import { useAddCategoryMutation } from "../../../services/categoryService";
import { MultipleInput, RichTextEditor } from "../../../components";
import { useEffect, useState } from "react";

const { CheckableTag } = Tag;
const { Text } = Typography;

interface Step1Props {
    mode: CouseMode;
    categoryList: any[];
    selectedLevels: string[];
    setSelectedLevels: (levels: string[]) => void;
}

export default function Step1_BasicInfo({
    mode,
    categoryList,
    selectedLevels,
    setSelectedLevels
}: Step1Props) {

    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [addCategory] = useAddCategoryMutation();

    // RESET CATEGORY KHI TẠO MỚI
    useEffect(() => {
        if (mode === CouseMode.CREATE) {
            dispatch(updateCourseCategory([]));
        }
    }, [mode]);

    // ADD CATEGORY BACKEND
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return message.warning("Nhập tên thể loại!");

        try {
            await addCategory({
                categoryName: newCategoryName,
                categoryDescription: newCategoryName
            }).unwrap();

            message.success("Đã thêm thể loại mới!");
            setNewCategoryName("");
        } catch {
            message.error("Không thể thêm thể loại!");
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>

            {/* TITLE */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <BookOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Tiêu đề khóa học</Text>
                    </Space>
                    <Input
                        placeholder="VD: Lập trình ReactJS từ A-Z"
                        value={course.title}
                        maxLength={80}
                        showCount
                        size="large"
                        onChange={(e) =>
                            dispatch(setCourseCreatedData({ ...course, title: e.target.value }))
                        }
                    />
                </Space>
            </Card>

            {/* DESCRIPTION */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <BookOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Mô tả khóa học</Text>
                    </Space>
                    <RichTextEditor
                        initialValue={course.description}
                        onChange={(val) =>
                            dispatch(setCourseCreatedData({ ...course, description: val }))
                        }
                    />
                </Space>
            </Card>

            {/* CATEGORY TAGS */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={20} style={{ width: "100%" }}>

                    <div
                        style={{
                            padding: 20,
                            background: "#fafafa",
                            borderRadius: 8,
                            border: "1px solid #f0f0f0"
                        }}
                    >
                        <Text strong style={{ fontSize: 14, marginBottom: 12, display: "block" }}>
                            Thể loại
                        </Text>

                        {/* LIST CATEGORY TAGS */}
                        <Space wrap size={[8, 8]} style={{ marginBottom: 16 }}>
                            {categoryList.map((cat: any) => {
                                const categoryId = cat.catgoryId;

                                const isChecked = course.courseCategories.some(
                                    (c: any) => c.categoryId === categoryId
                                );

                                return (
                                    <CheckableTag
                                        key={categoryId}
                                        checked={isChecked}
                                        onChange={(checked) => {

                                            const newCat = {
                                                categoryId,
                                                courseId: course.courseId || -1,
                                                courseCategoryId: -1,
                                                category: { ...cat } // FIX BUG SELECT ALL
                                            };

                                            const next = checked
                                                ? [...course.courseCategories, newCat]
                                                : course.courseCategories.filter(
                                                    (c: any) => c.categoryId !== categoryId
                                                );

                                            dispatch(updateCourseCategory(next));
                                        }}
                                    >
                                        {cat.name}
                                    </CheckableTag>
                                );
                            })}
                        </Space>

                        {/* ADD NEW CATEGORY */}
                        <Space.Compact style={{ width: "100%", maxWidth: 400 }}>
                            <Input
                                placeholder="Thêm thể loại mới..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onPressEnter={handleAddCategory}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddCategory}
                            >
                                Thêm
                            </Button>
                        </Space.Compact>
                    </div>
                </Space>
            </Card>

            {/* LEVEL */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <TrophyOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Cấp độ phù hợp</Text>
                    </Space>

                    <Space wrap size={[8, 8]}>
                        {["1", "2", "3"].map((lvl) => (
                            <CheckableTag
                                key={lvl}
                                checked={selectedLevels.includes(lvl)}
                                onChange={(checked) => {
                                    const next = checked
                                        ? [...selectedLevels, lvl]
                                        : selectedLevels.filter((x) => x !== lvl);
                                    setSelectedLevels(next);
                                }}
                                style={{ padding: "8px 20px", fontSize: 14 }}
                            >
                                {lvl === "1" && "🌱 Fresher"}
                                {lvl === "2" && "🚀 Junior"}
                                {lvl === "3" && "⭐ Master"}
                            </CheckableTag>
                        ))}
                    </Space>
                </Space>
            </Card>

            {/* KNOWLEDGE */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Space>
                        <BulbOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                        <Text strong style={{ fontSize: 15 }}>Mục tiêu khóa học</Text>
                    </Space>

                    <MultipleInput
                        maxInputItem={8}
                        maxLengthInput={120}
                        values={course.knowdledgeDescription}
                        seperator="|"
                        onDataChange={(data) => dispatch(setCourseKnowledge(data))}
                    />
                </Space>
            </Card>
        </Space>
    );
}
