import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

/* ===== TYPESCRIPT FIX ===== */
interface CkProps {
    value: string;
    onChange: (val: string) => void;
    uploadImage: (file: File) => Promise<string>;
}

export default function CkEditorCustom({ value, onChange, uploadImage }: CkProps) {
    return (
        <div className="ckeditor-wrapper">
            <CKEditor
                editor={ClassicEditor as any}   // ⭐ FIX ERROR 2322
                data={value}
                config={{
                    placeholder: "Viết nội dung bài viết...",
                    extraPlugins: [MyCustomUploadAdapterPlugin(uploadImage)],
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
            />
        </div>
    );
}

/* ===== CUSTOM IMAGE UPLOADER ===== */
function MyCustomUploadAdapterPlugin(uploadImage: (file: File) => Promise<string>) {
    return function (editor: any) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
            return new MyUploadAdapter(loader, uploadImage);
        };
    };
}

class MyUploadAdapter {
    loader: any;
    uploadImage: (file: File) => Promise<string>;

    constructor(loader: any, uploadImage: (file: File) => Promise<string>) {
        this.loader = loader;
        this.uploadImage = uploadImage;
    }

    async upload() {
        const file = await this.loader.file;
        const url = await this.uploadImage(file);
        return { default: url };
    }

    abort() {}
}
