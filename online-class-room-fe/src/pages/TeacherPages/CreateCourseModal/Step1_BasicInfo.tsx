import { Input, Button, Tag, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
    setCourseCreatedData,
    setCourseKnowledge,
    updateCourseCategory
} from "../../../slices/courseSlice";

import { useAddCategoryMutation } from "../../../services/categoryService";
import { MultipleInput, RichTextEditor } from "../../../components";
import { useEffect, useState } from "react";

const { CheckableTag } = Tag;

interface Step1Props {
    fieldList: any[];
    selectedFieldId: number | null;
    setSelectedFieldId: (id: number | null) => void;
    categories: any[];
    refetchCategories: () => void;

    selectedLevels: string[];
    setSelectedLevels: (levels: string[]) => void;
}

export default function Step1_BasicInfo({
    fieldList,
    selectedFieldId,
    setSelectedFieldId,
    categories,
    refetchCategories,
    selectedLevels,
    setSelectedLevels
}: Step1Props) {

    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [addCategory] = useAddCategoryMutation();

    const handleAddCategory = async () => {
        if (!selectedFieldId) return message.warning("Vui lòng chọn lĩnh vực!");
        if (!newCategoryName.trim()) return message.warning("Nhập tên thể loại!");

        try {
            await addCategory({
                categoryName: newCategoryName,
                categoryDescription: newCategoryName,
                fieldId: selectedFieldId
            }).unwrap();

            message.success("Đã thêm thể loại mới!");
            setNewCategoryName("");
            refetchCategories();
        } catch {
            message.error("Không thể thêm thể loại!");
        }
    };

    // Reset category khi đổi field
    useEffect(() => {
        dispatch(updateCourseCategory([]));
    }, [selectedFieldId]);

    return (
        <div className="flex flex-col gap-10">

            {/* TITLE */}
            <div>
                <p className="font-semibold mb-2 text-blue-600">Tiêu đề khóa học</p>
                <Input
                    placeholder="VD: Lập trình ReactJS từ A-Z"
                    value={course.title}
                    maxLength={80}
                    showCount
                    onChange={(e) =>
                        dispatch(setCourseCreatedData({ ...course, title: e.target.value }))
                    }
                />
            </div>

            {/* DESCRIPTION */}
            <div>
                <p className="font-semibold mb-2 text-blue-600">Mô tả khóa học</p>
                <RichTextEditor
                    initialValue={course.description}
                    onSave={(val) =>
                        dispatch(setCourseCreatedData({ ...course, description: val }))
                    }
                />
            </div>

            {/* FIELD */}
            <div>
                <p className="font-semibold mb-2 text-blue-600">Lĩnh vực</p>
                <Select
                    placeholder="Chọn lĩnh vực..."
                    style={{ width: 400 }}
                    value={selectedFieldId || undefined}
                    onChange={(v) => setSelectedFieldId(v)}
                    options={fieldList.map((f: any) => ({
                        label: f.name,
                        value: f.fieldId
                    }))}
                />
            </div>

            {/* CATEGORY */}
            {selectedFieldId && (
                <div>
                    <p className="font-semibold mb-2 text-blue-600">Thể loại theo lĩnh vực</p>

                    <div className="flex flex-wrap gap-2">
                        {categories.length === 0 && (
                            <span className="text-gray-500">Không có thể loại nào</span>
                        )}

                        {categories.map((cat: any) => (
                            <CheckableTag
                                key={cat.catgoryId}
                                checked={course.courseCategories.some(
                                    (c: any) => c.categoryId === cat.catgoryId
                                )}
                                onChange={(checked) => {
                                    const category = {
                                        categoryId: cat.catgoryId,
                                        courseId: -1,
                                        courseCategoryId: -1
                                    };

                                    const next = checked
                                        ? [...course.courseCategories, category]
                                        : course.courseCategories.filter(
                                            (c: any) => c.categoryId !== cat.catgoryId
                                        );

                                    dispatch(updateCourseCategory(next));
                                }}
                            >
                                {cat.name}
                            </CheckableTag>
                        ))}
                    </div>

                    <div className="mt-3 flex gap-2 w-full max-w-sm">
                        <Input
                            placeholder="Thêm thể loại mới..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <Button type="primary" onClick={handleAddCategory}>
                            Thêm
                        </Button>
                    </div>
                </div>
            )}

            {/* LEVEL */}
            <div>
                <p className="font-semibold mb-2 text-blue-600">Cấp độ phù hợp</p>

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
                    >
                        {lvl === "1" && "Fresher"}
                        {lvl === "2" && "Junior"}
                        {lvl === "3" && "Master"}
                    </CheckableTag>
                ))}
            </div>

            {/* KNOWLEDGE */}
            <div>
                <p className="font-semibold mb-2 text-blue-600">Mục tiêu khóa học</p>
                <MultipleInput
                    maxInputItem={8}
                    maxLengthInput={120}
                    values={course.knowdledgeDescription}
                    seperator="|"
                    onDataChange={(data) => dispatch(setCourseKnowledge(data))}
                />
            </div>
        </div>
    );
}
