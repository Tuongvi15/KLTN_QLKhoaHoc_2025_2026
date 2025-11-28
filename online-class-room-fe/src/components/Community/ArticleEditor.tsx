import React, { useEffect, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

type ArticleEditorProps = {
    content?: string;
    onChange?: (html: string) => void;
    uploadImage?: (file: File) => Promise<string>;
};

export default function ArticleEditor({
    content = "",
    onChange,
    uploadImage,
}: ArticleEditorProps) {
    const { quill, quillRef } = useQuill({
        theme: "snow",
        placeholder: "Viết nội dung bài viết...",
        modules: {
            toolbar: {
                container: [
                    [{ header: [1, 2, false] }],
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["code-block"],
                    ["link", "image"],
                ],
                handlers: {
                    image: async () => {
                        if (!quill || !uploadImage) return;

                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.click();

                        input.onchange = async () => {
                            if (!input.files) return;

                            const file = input.files[0];
                            const url = await uploadImage(file);

                            const range =
                                quill.getSelection() || {
                                    index: quill.getLength(),
                                    length: 0,
                                };

                            quill.insertEmbed(range.index, "image", url);
                            quill.setSelection(range.index + 1, 0);
                        };
                    },
                },
            },
        },
    });

    // Set initial HTML content
    useEffect(() => {
        if (quill && content) {
            quill.clipboard.dangerouslyPasteHTML(content);
        }
    }, [quill, content]);

    // Catch content changes
    useEffect(() => {
        if (!quill) return;

        const handler = () => {
            onChange?.(quill.root.innerHTML);
        };

        quill.on("text-change", handler);
        return () => {
            quill.off("text-change", handler);
        };
    }, [quill, onChange]);

    return (
        <div className="rounded-lg border border-gray-300">
            <div ref={quillRef} />
        </div>
    );
}
