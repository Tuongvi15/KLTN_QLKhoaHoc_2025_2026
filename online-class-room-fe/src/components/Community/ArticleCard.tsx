import { Link } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ArticleCard({ post }: any) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
        
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <Link to={`/community/article/${post.articleId}`}>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all duration-300 group">
                <div className="flex gap-4 p-4">
                    {/* Cover Image */}
                    {post.coverImageUrl && (
                        <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                            <img
                                src={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                                {post.authorName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-700">{post.authorName || 'Anonymous'}</span>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-1 text-gray-500">
                                    <AccessTimeIcon className="text-base" />
                                    <span>{formatDate(post.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                            {post.excerpt || 'Nhấn để đọc thêm...'}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <FavoriteIcon className="text-base" />
                                <span>{post.totalLikes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                <ChatBubbleOutlineIcon className="text-base" />
                                <span>{post.totalComments || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}