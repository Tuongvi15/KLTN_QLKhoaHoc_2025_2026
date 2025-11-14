import { useState, useEffect } from "react";
import { Button, Input, Popconfirm, message } from "antd";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import CreateIcon from "@mui/icons-material/Create";

import { useAddStepMutation, useUpdateStepMutation, useDeleteStepMutation } from "../../services/step.services";
import LectureVideoContent from "./LectureVideoContent";
import LectureQuizzContent from "./LectureQuizzContent";

import { Step } from "../../types/Course.type";

interface Props {
    position: number;
    isCreate: boolean;
    step: Step;
    onDelete: () => void;
    onSaved: (updatedStep: Step) => void;
}

export default function LectureCreator({
    position,
    isCreate,
    step,
    onDelete,
    onSaved
}: Props) {

    const [title, setTitle] = useState(step.title || "");
    const [editing, setEditing] = useState(isCreate);
    const [contentType, setContentType] = useState<"NONE" | "VIDEO" | "QUIZ">("NONE");
    const [currentStep, setCurrentStep] = useState(step);

    const [addStep] = useAddStepMutation();
    const [updateStep] = useUpdateStepMutation();
    const [deleteStep] = useDeleteStepMutation();

    useEffect(() => {
        setCurrentStep(step);
        setTitle(step.title || "");
    }, [step]);

    const handleSaveTitle = async () => {
        const t = title.trim();
        if (!t) {
            return message.warning("Tiêu đề bài học không được để trống!");
        }

        try {
            if (isCreate || currentStep.stepId === -1) {
                const created = await addStep({
                    sectionId: currentStep.sectionId,
                    title: t,
                    position,
                    duration: 0,
                    stepDescription: "",
                    videoUrl: "",
                    quizId: 1
                }).unwrap();

                setCurrentStep(created);
                onSaved(created);
                setEditing(false);
                message.success("Tạo bài học thành công!");
            } else {
                const updated = await updateStep({
                    ...currentStep,
                    title: t
                }).unwrap();

                setCurrentStep(updated);
                onSaved(updated);
                setEditing(false);
                message.success("Cập nhật tiêu đề bài học!");
            }
        } catch {
            message.error("Không thể lưu bài học!");
        }
    };

    const handleDelete = async () => {
        try {
            if (currentStep.stepId !== -1) {
                await deleteStep(currentStep.stepId).unwrap();
            }
            onDelete();
            message.success("Xóa bài học thành công!");
        } catch {
            message.error("Không thể xóa bài học!");
        }
    };

    const handleSelectContent = (type: "VIDEO" | "QUIZ") => {
        if (currentStep.stepId === -1) {
            return message.warning("Hãy lưu tiêu đề bài học trước khi thêm nội dung!");
        }
        setContentType(type);
    };

    return (
        <div className="border rounded-md p-4 bg-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Bài {position}:</span>

                    {!editing ? (
                        <span>{currentStep.title}</span>
                    ) : (
                        <Input
                            style={{ width: 300 }}
                            value={title}
                            maxLength={120}
                            showCount
                            onChange={(e) => setTitle(e.target.value)}
                            onPressEnter={handleSaveTitle}
                        />
                    )}
                </div>

                <div className="flex gap-1">
                    {!editing ? (
                        <IconButton size="small" onClick={() => setEditing(true)}>
                            <CreateIcon />
                        </IconButton>
                    ) : (
                        <IconButton size="small" onClick={handleSaveTitle}>
                            <DoneIcon />
                        </IconButton>
                    )}

                    <Popconfirm
                        title="Xóa bài học?"
                        onConfirm={handleDelete}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <IconButton size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Popconfirm>
                </div>
            </div>

            {/* CHỌN NỘI DUNG */}
            {currentStep.stepId !== -1 && (
                <div className="flex gap-3 mb-4">
                    <Button
                        type={contentType === "VIDEO" ? "primary" : "default"}
                        onClick={() => handleSelectContent("VIDEO")}
                    >
                        Video
                    </Button>

                    <Button
                        type={contentType === "QUIZ" ? "primary" : "default"}
                        onClick={() => handleSelectContent("QUIZ")}
                    >
                        Quiz
                    </Button>
                </div>
            )}

            {/* RENDER NỘI DUNG */}
            {contentType === "VIDEO" && (
                <LectureVideoContent
                    step={currentStep}
                    onSaved={(updated) => {
                        setCurrentStep(updated);
                        onSaved(updated);
                    }}
                />
            )}

            {contentType === "QUIZ" && (
                <LectureQuizzContent
                    step={currentStep}
                    onSaved={(updated) => {
                        setCurrentStep(updated);
                        onSaved(updated);
                    }}
                />
            )}
        </div>
    );
}
