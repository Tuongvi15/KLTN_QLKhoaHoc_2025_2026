import React, { useState } from "react";
import { Avatar, Button, Input, List, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
    useGetArticleDetailQuery,
    useLikeArticleMutation,
    useGetCommentsQuery,
    useCommentArticleMutation
} from "../../services/community.services";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

    const article = articleResp?.data ?? articleResp;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📄</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Bài viết không tồn tại
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Bài viết có thể đã bị xóa hoặc đường dẫn không chính xác
                    </p>
                    <button
                        onClick={() => navigate('/community')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const handleLike = async () => {
        try {
            await likeArticle(articleId).unwrap();
            setIsLiked(!isLiked);
            refetch();
            message.success(isLiked ? "Đã bỏ thích" : "Đã thích bài viết");
        } catch {
            message.error("Thao tác không thành công");
        }
    };

    const handleSendComment = async () => {
        if (!comment.trim()) {
            message.warning("Vui lòng nhập nội dung bình luận");
            return;
        }

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

    const comments = Array.isArray(commentsResp?.data)
        ? commentsResp.data
        : [];

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "—";

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;

        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
            {/* Header Navigation */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/community')}
                            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-all font-medium"
                        >
                            <ArrowBackIcon className="text-xl" />
                            <span>Quay lại</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                                title="Chia sẻ"
                            >
                                <ShareIcon className="text-gray-600" />
                            </button>
                            <button
                                className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                                title="Lưu bài viết"
                            >
                                <BookmarkBorderIcon className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto px-4 py-8">
                {/* Cover Image */}
                {article.coverImageUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src={article.coverImageUrl}
                            className="w-full h-[400px] object-cover"
                            alt="cover"
                        />
                    </div>
                )}

                {/* Article Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    {/* Title */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {/* Author Info */}
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <Avatar
                                size={48}
                                src={article.authorAvatar}
                                className="border-2 border-purple-100"
                            >
                                {!article.authorAvatar && article.authorName?.charAt(0)}
                            </Avatar>
                            <div>
                                <div className="font-semibold text-gray-900">
                                    {article.authorName}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <AccessTimeIcon className="text-base" />
                                    <span>{formatDate(article.createdAt)}</span>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Engagement Stats */}
                    <div className="flex items-center gap-6 mt-6">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isLiked
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {isLiked ? (
                                <FavoriteIcon className="text-xl" />
                            ) : (
                                <FavoriteBorderIcon className="text-xl" />
                            )}
                            <span className="font-semibold">{article.totalLikes}</span>
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                            <ChatBubbleOutlineIcon className="text-xl" />
                            <span className="font-semibold">{article.totalComments}</span>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                    <div
                        className="prose prose-lg max-w-none
                            prose-headings:font-bold prose-headings:text-gray-900
                            prose-p:text-gray-700 prose-p:leading-relaxed
                            prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-900
                            prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-gray-900 prose-pre:text-gray-100
                            prose-img:rounded-xl prose-img:shadow-lg
                            prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-1"
                        dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }}
                    />
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            Bình luận ({comments.length})
                        </h3>
                    </div>

                    {/* Comment Input */}
                    <div className="mb-8">
                        <div className="relative">
                            <Input.TextArea
                                rows={3}
                                placeholder="Chia sẻ suy nghĩ của bạn..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="rounded-xl border-gray-200 focus:border-purple-500 resize-none"
                                onPressEnter={(e) => {
                                    if (e.ctrlKey || e.metaKey) {
                                        handleSendComment();
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-500">
                                    Nhấn Ctrl + Enter để gửi
                                </span>
                                <button
                                    onClick={handleSendComment}
                                    disabled={!comment.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    <SendIcon className="text-base" />
                                    <span>Gửi</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div className="space-y-4">
                            {comments.map((item: any) => (
                                <div key={item.commentId} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex gap-3">
                                        <Avatar src={item.authorAvatar}>
                                            {!item.authorAvatar && item.authorName?.charAt(0)}
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{item.authorName}</div>
                                            <div className="text-xs text-gray-400">
                                                {formatDate(item.createdAt)}
                                            </div>
                                            <p className="text-gray-700 mt-1">{item.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Chưa có bình luận nào.</p>
                    )}

                </div>
            </article>
        </div>
    );
}