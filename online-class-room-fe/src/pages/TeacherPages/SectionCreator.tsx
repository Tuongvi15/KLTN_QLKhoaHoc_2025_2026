import { Button, Input, Popconfirm, message, Collapse, Space } from "antd";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import AddIcon from "@mui/icons-material/Add";
import LectureCreator from "./LectureCreator";
import { Section, Step } from "../../types/Course.type";
import { useDispatch, useSelector } from "react-redux";
import { setSectionList } from "../../slices/courseSlice";
import { RootState } from "../../store";

interface SectionCreatorProps {
    index: number;
    section: Section;
    onUpdateTitle: (sectionId: number, title: string) => void;
    onDelete: (sectionId: number) => void;
    collapsed?: boolean; // receive collapsed from parent
    onToggleCollapsed?: () => void;
}

export default function SectionCreator({
    index,
    section,
    onUpdateTitle,
    onDelete,
    collapsed = false,
    onToggleCollapsed,
}: SectionCreatorProps) {
    const dispatch = useDispatch();
    const existingSections = useSelector((state: RootState) => state.course.addCourse.courseCreatedData?.sections || []);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(section.title || "");
    const [steps, setSteps] = useState<Step[]>(section.steps || []);
    const [stepsCollapsed, setStepsCollapsed] = useState<boolean>(collapsed);

    useEffect(() => {
        setTitle(section.title || "");
        setSteps(section.steps || []);
        setStepsCollapsed(collapsed);
    }, [section, collapsed]);

    const handleSaveTitle = () => {
        const trimmed = (title || "").trim();
        if (!trimmed) {
            message.warning("Tiêu đề chương không được để trống");
            return;
        }
        onUpdateTitle(section.sectionId, trimmed);
        setIsEditing(false);
    };

    const handleAddStepLocal = () => {
        const newStep: Step = {
            stepId: -1,
            sectionId: section.sectionId,
            section: undefined,
            position: steps.length + 1,
            title: "Bài mới",
            stepDescription: "",
            videoUrl: "",
            quizId: 1,
            duration: 0,
            quiz: undefined,
        };

        const next = [...steps, newStep];
        setSteps(next);

        // Update the full sections list in store by replacing this section's steps
        const newSections = existingSections.map((s) =>
            s.sectionId === section.sectionId ? { ...s, steps: next } : s
        );
        dispatch(setSectionList(newSections));

        // auto expand steps when adding
        setStepsCollapsed(false);
    };

    const handleRemoveStepLocal = (stepId: number) => {
        const next = steps.filter((s) => s.stepId !== stepId);
        setSteps(next);

        const newSections = existingSections.map((s) =>
            s.sectionId === section.sectionId ? { ...s, steps: next } : s
        );
        dispatch(setSectionList(newSections));
    };

    const handleOnStepUpdated = (updatedStep: Step) => {
        // If updatedStep.stepId is newly created (was -1 before), replace the first -1 in local steps.
        if (updatedStep.stepId !== -1) {
            // Regular update: replace by stepId if present, otherwise replace first -1
            let replacedSteps = steps.map((s) => (s.stepId === updatedStep.stepId ? updatedStep : s));

            // If no replacement happened (created new step), find first -1 and replace it
            const didReplace = replacedSteps.some((s) => s.stepId === updatedStep.stepId);
            if (!didReplace) {
                const ix = replacedSteps.findIndex((s) => s.stepId === -1);
                if (ix >= 0) {
                    replacedSteps[ix] = updatedStep;
                } else {
                    // fallback: append
                    replacedSteps = [...replacedSteps, updatedStep];
                }
            }

            setSteps(replacedSteps);

            const newSections = existingSections.map((s) =>
                s.sectionId === section.sectionId ? { ...s, steps: replacedSteps } : s
            );
            dispatch(setSectionList(newSections));
            return;
        }

        // updatedStep.stepId === -1 (shouldn't usually happen) - just update local
        const next = steps.map((s) => (s.stepId === updatedStep.stepId ? updatedStep : s));
        setSteps(next);
        const newSections = existingSections.map((s) =>
            s.sectionId === section.sectionId ? { ...s, steps: next } : s
        );
        dispatch(setSectionList(newSections));
    };

    const toggleSteps = () => {
        setStepsCollapsed((p) => !p);
        if (onToggleCollapsed) onToggleCollapsed();
    };

    return (
        <div className="bg-white border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <p className="font-bold">Chương {index + 1}:</p>
                    {!isEditing ? (
                        <span className="font-medium">{section.title || "(Chưa đặt tên)"}</span>
                    ) : (
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onPressEnter={handleSaveTitle}
                            style={{ width: 360 }}
                        />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button size="small" onClick={toggleSteps}>
                        {stepsCollapsed ? "Mở bài" : "Thu bài"}
                    </Button>

                    {!isEditing ? (
                        <IconButton size="small" onClick={() => setIsEditing(true)}>
                            <CreateIcon />
                        </IconButton>
                    ) : (
                        <IconButton size="small" onClick={handleSaveTitle}>
                            <DoneIcon />
                        </IconButton>
                    )}

                    <Popconfirm
                        title="Xác nhận xóa chương này?"
                        onConfirm={() => onDelete(section.sectionId)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <IconButton size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Popconfirm>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {stepsCollapsed ? (
                    <div className="text-sm text-gray-500">Danh sách bài đã ẩn — nhấn "Mở bài" để xem</div>
                ) : (
                    <>
                        {steps.length === 0 && (
                            <div className="text-gray-500">Chưa có bài học nào. Thêm bài học để bắt đầu.</div>
                        )}

                        {steps.map((step, idx) => (
                            <div key={`${step.stepId}-${idx}`} className="py-2">
                                <LectureCreator
                                    position={idx + 1}
                                    isCreate={step.stepId === -1}
                                    step={step}
                                    onDelete={() => handleRemoveStepLocal(step.stepId)}
                                    onSaved={handleOnStepUpdated}
                                />
                            </div>
                        ))}

                        <div className="mt-2">
                            <Button icon={<AddIcon />} onClick={handleAddStepLocal}>
                                Thêm bài học
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
