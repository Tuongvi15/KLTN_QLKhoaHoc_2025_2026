import { useEffect, useState } from "react";
import { Popconfirm, message, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../store';
import { UploadFileCustom, Video } from "../../components";
import { UploadFileType, UploadStyle } from "../../components/UploadFile/UploadFileCustom";
import { useUpdateStepMutation } from "../../services/step.services";
import { setStep } from "../../slices/courseSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import { deleteFile } from "../../utils/FirebaseUtils";

interface Props {
  step: any;
  onSaved?: (updated: any) => void;
}

export default function LectureVideoContent({ step, onSaved }: Props) {
  const dispatch = useDispatch();
  const courseId = useSelector((s: RootState) => s.course.addCourse.courseCreatedData.courseId);
  const [updateStep, { isSuccess, data }] = useUpdateStepMutation();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setStep(data));
      onSaved?.(data);
    }
  }, [isSuccess, data]);

  const fileName = `lecture-${step.stepId}`;
  const storagePath = `videos/courses/course-${courseId}/section-${step.sectionId}/`;

  const onUploadSuccess = (url: string, duration?: number) => {
    updateStep({
      ...step,
      videoUrl: url,
      duration: duration ? Math.ceil(duration) : step.duration || 0,
    }).unwrap().catch(() => {
      message.error("Cập nhật video thất bại");
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteFile(storagePath + fileName, () => {
      updateStep({
        ...step,
        videoUrl: "",
        duration: 0,
      })
        .unwrap()
        .then(() => {
          message.success("Xóa video thành công");
        })
        .catch(() => {
          message.error("Xóa video thất bại");
        })
        .finally(() => setIsDeleting(false));
    }, (err) => {
      console.error(err);
      message.error("Xóa file thất bại");
      setIsDeleting(false);
    });
  };

  return (
    <div className="p-2">
      {/* If no video or short url -> show uploader */}
      {( !step?.videoUrl || step.videoUrl.length < 10 ) ? (
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <UploadFileCustom
              fileName={fileName}
              fileType={UploadFileType.VIDEO}
              onUploadFileSuccess={(url: string, duration?: number) => onUploadSuccess(url, duration)}
              onUploadFileError={(e) => {
                console.error(e);
                message.error("Tải video thất bại");
              }}
              storePath={storagePath}
              uploadStyle={UploadStyle.SMALL}
              showPreview={false}
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          <div className="flex-1 max-w-[640px]">
            <Video src={step.videoUrl} />
          </div>

          <div className="flex flex-col gap-2">
            <Button type="default" onClick={() => {
              // allow replacing by reuploading: show uploader via state change
              message.info("Nhấn Tải lại video để thay thế video hiện tại");
            }}>
              Tải lại
            </Button>

            <Popconfirm
              title="Xóa video?"
              onConfirm={handleDelete}
              okText="Xóa"
              cancelText="Hủy"
            >
              <IconButton size="small" disabled={isDeleting}>
                <DeleteIcon />
              </IconButton>
            </Popconfirm>
          </div>
        </div>
      )}
    </div>
  );
}
