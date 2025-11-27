// src/components/Community/ArticleEditor.tsx
import React, { useCallback, useEffect } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "antd";

type Props = {
    content?: string;
    onChange?: (html: string) => void;
    uploadImage?: (file: File) => Promise<string>; // returns URL
};

export default function ArticleEditor({
    content = "<p></p>",
    onChange,
    uploadImage,
}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link,
            Underline,
            Placeholder.configure({
                placeholder: "Viết nội dung bài viết...",
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class:
                    "prose prose-lg max-w-none focus:outline-none min-h-[300px]",
            },
        },
        onUpdate: ({ editor }: { editor: Editor }) => {
            if (onChange) onChange(editor.getHTML());
        },
    });

    // Handle inline image upload
    const handleImageUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;

            try {
                if (uploadImage) {
                    // Upload to server
                    const url = await uploadImage(file);
                    editor.chain().focus().setImage({ src: url }).run();
                } else {
                    // fallback: base64
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = reader.result as string;
                        editor.chain().focus().setImage({ src: base64 }).run();
                    };
                    reader.readAsDataURL(file);
                }
            } catch (err) {
                console.error("Upload image failed:", err);
            }

            // reset input
            e.target.value = "";
        },
        [editor, uploadImage]
    );

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <div>
            {/* Toolbar */}
            <div className="mb-3 flex gap-2 flex-wrap">
                <Button size="small" onClick={() => editor.chain().focus().toggleBold().run()}>
                    <b>B</b>
                </Button>

                <Button size="small" onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <i>I</i>
                </Button>

                <Button size="small" onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <u>U</u>
                </Button>

                <Button
                    size="small"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    • List
                </Button>

                <Button
                    size="small"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                    {"</>"}
                </Button>

                <label>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                    />
                    <Button size="small">Ảnh</Button>
                </label>
            </div>

            {/* Editor */}
            <div className="border rounded-lg p-4 bg-white min-h-[300px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
