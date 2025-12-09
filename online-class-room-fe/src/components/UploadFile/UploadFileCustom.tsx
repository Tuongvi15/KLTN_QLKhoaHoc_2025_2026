import { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/es/upload';
import { Empty, Progress, Typography, message } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';
import { LoadingButton } from '@mui/lab';
import { Video } from '..';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';
import { convertFileSize } from '../../utils/NumberFormater';
import { firebaseStorage } from '../../firebase/firebase';

export enum UploadFileType {
    IMAGE,
    VIDEO,
    PDF,
}

export enum UploadStyle {
    LARGE,
    SMALL,
}

interface UploadFileProps {
    storePath: string;
    fileName: string;
    onUploadFileSuccess: (downloadURL: string, fileDuration?: number) => void;
    onUploadFileError: (error: FirebaseError) => void;
    fileType: UploadFileType;
    showPreview: boolean;
    buttonText?: string;
    isLoading?: boolean;
    imgLink?: string;
    uploadStyle?: UploadStyle;
}

const ImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
const VideoExtensions = ['mp4', 'avi', 'mov', 'webm', 'mkv'];
const PdfExtensions = ['pdf'];

const UploadFileCustom = ({
    storePath,
    onUploadFileSuccess,
    onUploadFileError,
    fileType,
    showPreview,
    fileName,
    buttonText = 'Lưu',
    isLoading = false,
    imgLink = '',
    uploadStyle = UploadStyle.LARGE,
}: UploadFileProps) => {

    const [Preview, setPreview] = useState<string | undefined>(undefined);

    const allowedExtensions =
        fileType === UploadFileType.IMAGE
            ? ImageExtensions
            : fileType === UploadFileType.VIDEO
                ? VideoExtensions
                : PdfExtensions;

    const errorMessageTypeFit =
        fileType === UploadFileType.IMAGE
            ? "Vui lòng chỉ chọn file ảnh!"
            : fileType === UploadFileType.VIDEO
                ? "Vui lòng chỉ chọn file video!"
                : "Vui lòng chỉ chọn file PDF!";

    const filePath = (storePath.endsWith('/') ? storePath : storePath + '/') + fileName;
    const storageRef = ref(firebaseStorage, filePath);

    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [percent, setPercent] = useState(0);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [tempSelectedFile, setTempSelectedFile] = useState<any>(null);
    const [duration, setDuration] = useState(0);
    const [showImage, setShowImage] = useState(imgLink && imgLink?.length > 10);

    // ===================== UPLOAD FILE =====================
    const uploadFile = () => {
        if (selectedFile) {
            setUploadLoading(true);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const percent = Math.floor(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setPercent(percent);
                },
                (error: FirebaseError) => {
                    console.error(error.message);
                    onUploadFileError(error);
                    setSelectedFile(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {

                        console.log("PDF Uploaded URL =", downloadURL);

                        onUploadFileSuccess(downloadURL, duration);
                        setPreview(undefined);
                        message.success("Upload file thành công!");
                        setShowImage(true);
                        setUploadLoading(false);
                        setSelectedFile(null);
                    });
                }
            );
        }
    };

    // ===================== HANDLE SELECT FILE =====================
    const handleOnBeforeUpload = (file: RcFile) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || "";
        const isAllowed = allowedExtensions.includes(ext);
        return isAllowed ? true : false;
    };

    const handleOnSelectedFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
        const file = info.fileList.pop()?.originFileObj;
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase() || "";
        const isAllowed = allowedExtensions.includes(extension);

        if (!isAllowed) {
            message.error(errorMessageTypeFit);
            return;
        }

        setSelectedFile(file);
        setTempSelectedFile(file);

        // ⭐ PDF: Chỉ hiển thị tên file
        if (fileType === UploadFileType.PDF) {
            setPreview(file.name);
            return;
        }

        // ⭐ Image/video: preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setPreview(reader.result as string);
    };

    // ===================== HANDLE SMALL MODE =====================
    const handleOnInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase() || "";
        const isAllowed = allowedExtensions.includes(ext);

        if (!isAllowed) {
            message.error(errorMessageTypeFit);
            return;
        }

        setSelectedFile(file);
        setTempSelectedFile(file);
        if (fileType === UploadFileType.PDF) setPreview(file.name);
    };

    // ===================== LOAD VIDEO DURATION =====================
    useEffect(() => {
        if (selectedFile && fileType === UploadFileType.VIDEO) {
            const reader = new FileReader();
            reader.onload = () => {
                const video = document.createElement("video");
                video.src = reader.result as string;
                video.onloadedmetadata = () => setDuration(video.duration);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, [selectedFile, fileType]);

    // ===================== UI OUTPUT =====================
    return (
        <div>
            {uploadStyle === UploadStyle.LARGE && (
                <div className="m-auto flex w-[500px] max-w-[500px] overflow-hidden">
                    <motion.div
                        initial={{ transform: showImage ? 'translateX(-50%)' : 'translateX(0)' }}
                        animate={{ transform: showImage ? 'translateX(-50%)' : 'translateX(0)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex">

                            {/* LEFT SIDE: PREVIEW + DRAGGER */}
                            <div className="flex w-[500px] flex-col gap-8">

                                {showPreview && (
                                    <div>
                                        <Typography.Title level={5}>Xem trước</Typography.Title>

                                        <div className="border p-4 bg-[#f7f9fa]">
                                            {!Preview && <Empty />}

                                            {Preview && fileType === UploadFileType.IMAGE && (
                                                <img src={Preview} alt="" className="m-auto" />
                                            )}

                                            {Preview && fileType === UploadFileType.VIDEO && (
                                                <Video src={Preview} />
                                            )}

                                            {Preview && fileType === UploadFileType.PDF && (
                                                <div className="text-blue-600 text-center font-medium">
                                                    📄 {Preview}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Dragger
                                    showUploadList={false}
                                    multiple={false}
                                    onChange={handleOnSelectedFileChange}
                                    beforeUpload={handleOnBeforeUpload}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Ấn hoặc kéo file vào đây</p>
                                    <p className="ant-upload-hint">
                                        Nghiêm cấm hành vi tải file đồi trụy/bạo lực
                                    </p>
                                </Dragger>

                                {percent > 0 && percent < 100 && (
                                    <div>
                                        <Progress percent={percent} />
                                        <div className="text-xs">
                                            File: {selectedFile?.name}
                                        </div>
                                    </div>
                                )}

                                <LoadingButton
                                    loading={isLoading || uploadLoading}
                                    onClick={uploadFile}
                                    disabled={!selectedFile}
                                    variant="contained"
                                >
                                    {buttonText}
                                </LoadingButton>
                            </div>

                            {/* RIGHT SIDE (IMAGE/VIDEO ONLY) */}
                            <div className="flex w-[500px] flex-col gap-8">
                                <div className="border p-4 bg-[#f7f9fa]">
                                    {imgLink && fileType === UploadFileType.IMAGE && (
                                        <img src={imgLink} alt="" className="m-auto" />
                                    )}
                                    {imgLink && fileType === UploadFileType.VIDEO && (
                                        <Video src={imgLink} />
                                    )}
                                </div>
                                <Button onClick={() => setShowImage(false)} variant="contained">
                                    Chỉnh sửa
                                </Button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}

            {/* ================= SMALL MODE ================= */}
            {uploadStyle === UploadStyle.SMALL && (
                <div className="w-full">
                    {/* INPUT chọn file */}
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="upload"
                            className="flex-1 h-[45px] px-4 flex items-center border border-gray-300 rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
                        >
                            {!selectedFile && "Chưa chọn file nào"}
                            {selectedFile && (
                                <span className="truncate max-w-[250px]">
                                    {selectedFile.name}
                                </span>
                            )}
                        </label>

                        <input
                            id="upload"
                            type="file"
                            className="hidden"
                            onChange={handleOnInputFileChange}
                        />

                        <LoadingButton
                            loading={isLoading || uploadLoading}
                            onClick={uploadFile}
                            disabled={!selectedFile}
                            variant="contained"
                            className="!h-[45px] !rounded-md"
                        >
                            {buttonText}
                        </LoadingButton>
                    </div>

                    {/* HIỂN THỊ SAU KHI UPLOAD */}
                    {percent > 0 && percent < 100 && (
                        <div className="mt-2">
                            <Progress percent={percent} />
                        </div>
                    )}

                    {percent === 100 && (
                        <p className="text-green-600 mt-2 flex items-center gap-2">
                            <span>📄 {selectedFile?.name}</span>
                            <span className="text-green-500">●</span>
                            <span>Upload thành công</span>
                        </p>
                    )}
                </div>
            )}

        </div>
    );
};

export default UploadFileCustom;
