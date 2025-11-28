import React from "react";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import MarkdownIt from "markdown-it";

const mdParser = new MarkdownIt();

export default function MarkdownEditor({ value, onChange, onUploadImage }: { value: string; onChange: (text: string) => void; onUploadImage: (file: File) => Promise<{ id: string }> }) {
    const handleImageUpload = async (file: File) => {
        const image = await onUploadImage(file);

        // F8 style: trả về dạng ![id]({{id}})
        const imgMarkdown = `![${image.id}]({{${image.id}}})`;

        return imgMarkdown;
    };

    return (
        <MdEditor
            value={value}
            style={{ height: "500px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={({ text }) => onChange(text)}
            onImageUpload={handleImageUpload}
        />
    );
}
