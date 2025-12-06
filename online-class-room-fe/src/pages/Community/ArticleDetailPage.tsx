import React, { useState } from "react";
import { Avatar, Input, message, Modal } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetArticleDetailQuery,
    useLikeArticleMutation,
    useGetCommentsQuery,
    useCommentArticleMutation
} from "../../services/community.services";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function ArticleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const articleId = Number(id);

    const { data: articleResp, isLoading, refetch } = useGetArticleDetailQuery(articleId);
    const { data: commentsResp, refetch: refetchComments } = useGetCommentsQuery(articleId);

    const [likeArticle] = useLikeArticleMutation();
    const [commentArticle] = useCommentArticleMutation();

    const [comment, setComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Drawer Comment
    const [openDrawer, setOpenDrawer] = useState(false);

    const article = articleResp?.data ?? articleResp;
    function getAuth() {
        try {
            const json = sessionStorage.getItem("persist:root");
            if (!json) return null;

            const root = JSON.parse(json);
            const auth = JSON.parse(root.auth || "{}");

            return auth?.isLogin ? auth : null;
        } catch {
            return null;
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    const comments = Array.isArray(commentsResp?.items) ? commentsResp.items : [];

    const handleLike = async () => {
        if (!getAuth()) {
            setShowLoginModal(true);
            return;
        }

        try {
            await likeArticle(articleId).unwrap();
            setIsLiked(!isLiked);
            refetch();
            message.success(isLiked ? "Đã bỏ thích" : "Đã thích bài viết");
        } catch {
            message.error("Không thể like bài viết");
        }
    };


    const handleSendComment = async () => {
        if (!getAuth()) {
            setShowLoginModal(true);
            return;
        }

        if (!comment.trim()) return;

        try {
            await commentArticle({ id: articleId, content: comment }).unwrap();
            setComment("");
            refetchComments();
            refetch();
            message.success("Đã gửi bình luận");
        } catch {
            message.error("Không thể gửi bình luận");
        }
    };


    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        message.success("Đã sao chép liên kết");
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!article) return <div>Bài viết không tồn tại</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">

            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/community")}
                        className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
                    >
                        <ArrowBackIcon />
                        <span>Quay lại</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ShareIcon />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <BookmarkBorderIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* ARTICLE MAIN GRID — LEFT SIDEBAR + CONTENT */}
            <article className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-12 gap-10">

                {/* LEFT SIDEBAR — F8 STYLE */}
                <div className="hidden md:block col-span-3 space-y-6">

                    {/* AUTHOR */}
                    <div className="flex flex-col items-start gap-3">
                        <Avatar size={48} src={article.authorAvatar} />
                        <div className="text-lg font-semibold text-gray-900">
                            {article.authorName}
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatDate(article.createdAt)}
                        </div>
                    </div>

                    {/* LIKE + COMMENT */}
                    <div className="flex flex-col gap-5">

                        {/* Like */}
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition"
                        >
                            {isLiked ? (
                                <FavoriteIcon className="text-xl text-red-500" />
                            ) : (
                                <FavoriteBorderIcon className="text-xl" />
                            )}
                            <span className="text-lg">{article.totalLikes}</span>
                        </button>

                        {/* Comment */}
                        <button
                            onClick={() => setOpenDrawer(true)}
                            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
                        >
                            <ChatBubbleOutlineIcon className="text-xl" />
                            <span className="text-lg">{article.totalComments}</span>
                        </button>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="col-span-12 md:col-span-9">

                    {/* COVER IMAGE */}
                    {article.coverImageUrl && (
                        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                            <img
                                src={article.coverImageUrl}
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    )}

                    {/* TITLE */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {/* ARTICLE CONTENT */}
                    <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                        />
                    </div>
                </div>
            </article>

            {/* ===== COMMENT DRAWER (F8 STYLE) ===== */}

            {/* Overlay */}
            <div
                onClick={() => setOpenDrawer(false)}
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] transition-opacity duration-300 ${openDrawer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-[100]
                transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                ${openDrawer ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Bình luận ({comments.length})</h3>
                    <button
                        onClick={() => setOpenDrawer(false)}
                        className="text-gray-600 hover:text-black text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-b">
                    <Input.TextArea
                        rows={3}
                        placeholder="Viết bình luận..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                        onClick={handleSendComment}
                        disabled={!comment.trim()}
                        className="mt-3 px-4 py-2 bg-purple-600 text-white w-full rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        Gửi bình luận
                    </button>
                </div>

                {/* Comment List */}
                <div className="p-4 overflow-y-auto h-[calc(100%-180px)]">
                    {comments.length === 0 && (
                        <p className="text-gray-500">Chưa có bình luận nào.</p>
                    )}

                    <div className="space-y-4">
                        {comments.map((item: any) => (
                            <div key={item.commentId} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex gap-3">
                                    <Avatar src={item.authorAvatar} />
                                    <div>
                                        <div className="font-semibold">{item.authorName}</div>
                                        <div className="text-xs text-gray-400">
                                            {formatDate(item.createdAt)}
                                        </div>
                                        <p className="text-sm mt-1">{item.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                open={showLoginModal}
                onCancel={() => setShowLoginModal(false)}
                footer={null}
                centered
            >
                <h2 className="text-xl font-bold mb-2">Bạn cần đăng nhập</h2>
                <p className="text-gray-600 mb-4">Hãy đăng nhập để thực hiện hành động này.</p>

                <button
                    className="w-full py-2 font-bold text-white"
                    style={{ backgroundColor: "#7c3aed" }}
                    onClick={() => {
                        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    }}
                >
                    Đăng nhập ngay
                </button>
            </Modal>

        </div>
    );
}
