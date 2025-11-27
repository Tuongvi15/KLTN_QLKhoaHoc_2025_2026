import { useCallback, useEffect } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';

type Props = {
    content?: string;
    onChange?: (html: string) => void;
    uploadImage?: (file: File) => Promise<string>;
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
                placeholder: "Viết nội dung bài viết của bạn...",
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: "prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3",
            },
        },
        onUpdate: ({ editor }: { editor: Editor }) => {
            if (onChange) onChange(editor.getHTML());
        },
    });

    const handleImageUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;

            try {
                if (uploadImage) {
                    const url = await uploadImage(file);
                    editor.chain().focus().setImage({ src: url }).run();
                } else {
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

    const ToolbarButton = ({ 
        onClick, 
        active, 
        children 
    }: { 
        onClick: () => void; 
        active?: boolean; 
        children: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded-lg transition-all duration-200 ${
                active
                    ? 'bg-purple-100 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                >
                    <FormatBoldIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                >
                    <FormatItalicIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                >
                    <FormatUnderlinedIcon />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                >
                    <FormatListBulletedIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    active={editor.isActive('codeBlock')}
                >
                    <CodeIcon />
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                    />
                    <div className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200">
                        <ImageIcon />
                    </div>
                </label>
            </div>

            {/* Editor Content */}
            <div className="bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}