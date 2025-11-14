import { UploadFileCustom } from "../../../components";
import { UploadFileType } from "../../../components/UploadFile/UploadFileCustom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { updateCourseImageUrl, updateCoursePreviewUrl } from "../../../slices/courseSlice";
import { message } from "antd";

export default function Step2_MediaUpload() {
    const dispatch = useDispatch();
    const course = useSelector((state: RootState) => state.course.addCourse.courseCreatedData);

    return (
        <div className="flex flex-col gap-10">
            <div>
                <p className="font-semibold mb-2 text-[#1677ff]">Ảnh khóa học</p>
                <UploadFileCustom
                    fileName={`thumbnail-course-${course.courseId || "temp"}`}
                    fileType={UploadFileType.IMAGE}
                    onUploadFileSuccess={(url) => {
                        dispatch(updateCourseImageUrl(url));
                        message.success("Đã tải ảnh khóa học!");
                    }}
                    onUploadFileError={(e) => {
                        console.error("❌ Lỗi tải ảnh:", e);
                        message.error("Tải ảnh thất bại, vui lòng thử lại!");
                    }}
                    storePath="images/courseThumbnail/"
                    showPreview
                    imgLink={course.imageUrl}
                />
            </div>

            <div>
                <p className="font-semibold mb-2 text-[#1677ff]">Video giới thiệu</p>
                <UploadFileCustom
                    fileName={`preview-course-${course.courseId || "temp"}`}
                    fileType={UploadFileType.VIDEO}
                    onUploadFileSuccess={(url) => {
                        dispatch(updateCoursePreviewUrl(url));
                        message.success("Đã tải video giới thiệu!");
                    }}
                    onUploadFileError={(e) => {
                        console.error("❌ Lỗi tải video:", e);
                        message.error("Tải video thất bại, vui lòng thử lại!");
                    }}
                    storePath="videos/coursePreview/"
                    showPreview
                    imgLink={course.videoPreviewUrl}
                />
            </div>
        </div>
    );
}
