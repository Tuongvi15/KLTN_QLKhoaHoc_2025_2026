// src/pages/Community/CommunityListPage.tsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetArticlesQuery } from "../../services/community.services";
import ArticleCard from "../../components/Community/ArticleCard";

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArticleIcon from '@mui/icons-material/Article';

export default function CommunityListPage() {
    const [filter, setFilter] = useState("new");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    // Call API
    const { data, isLoading } = useGetArticlesQuery({
        page,
        pageSize: 10,
    });

    const rawPosts = data?.items ?? [];

    // 🔥 FILTER + SEARCH + SORT (FE ONLY)
    const posts = useMemo(() => {
        let result = [...rawPosts];

        // SEARCH
        if (searchQuery.trim()) {
            result = result.filter((p) =>
                (p.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.excerpt ?? "").toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // FILTER
        if (filter === "new") {
            result.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
        else if (filter === "hot") {
            result.sort((a, b) => b.totalLikes - a.totalLikes);
        }
        else if (filter === "trending") {
            result.sort((a, b) =>
                (b.totalLikes + b.totalComments) -
                (a.totalLikes + a.totalComments)
            );
        }
        else if (filter === "following") {
            result = result;
        }

        return result;
    }, [rawPosts, filter, searchQuery]);

    const filterOptions = [
        { id: "new", label: "Mới nhất", icon: NewReleasesIcon },
        { id: "trending", label: "Thịnh hành", icon: TrendingUpIcon },
        { id: "hot", label: "Hot", icon: LocalFireDepartmentIcon },
        { id: "following", label: "Đang theo dõi", icon: FavoriteIcon },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
            {/* Header - Modern & Vibrant */}
            <div className="border-b border-gray-100 sticky top-0 z-10 bg-white/90 backdrop-blur-xl shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Cộng đồng
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Chia sẻ kiến thức và kết nối cùng nhau</p>
                        </div>

                        {/* Nút tạo bài viết */}
                        <Link to="/community/write">
                            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm font-semibold">
                                <AddCircleIcon className="text-xl" />
                                <span>Viết bài</span>
                            </button>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết, chủ đề hoặc tác giả..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Left Sidebar - Modern Card Style */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-28 space-y-4">
                            {/* Filter Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <FilterListIcon className="text-white text-lg" />
                                    </div>
                                    <h2 className="font-bold text-gray-900">Bộ lọc</h2>
                                </div>
                                <div className="space-y-2">
                                    {filterOptions.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setFilter(id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                                                filter === id
                                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-[1.02]"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <Icon className="text-xl" />
                                            <span>{label}</span>
                                            {filter === id && (
                                                <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                        <ArticleIcon className="text-purple-600 text-lg" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Thống kê</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">Tổng bài viết</span>
                                        <span className="text-lg font-bold text-purple-600">{data?.totalCount || 0}</span>
                                    </div>
                                    <div className="h-px bg-purple-200"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">Mới hôm nay</span>
                                        <span className="text-lg font-bold text-pink-600">12</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-900 mb-3">Khám phá</h3>
                                <div className="space-y-2">
                                    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                                        🔥 Chủ đề hot
                                    </button>
                                    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                                        ⭐ Tác giả nổi bật
                                    </button>
                                    <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all">
                                        📚 Danh mục
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Mobile Filter Pills */}
                        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {filterOptions.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setFilter(id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium shadow-sm ${
                                        filter === id
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105"
                                            : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300"
                                    }`}
                                >
                                    <Icon className="text-lg" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Filter Info Banner */}
                        <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    {filterOptions.find(f => f.id === filter)?.icon && 
                                        (() => {
                                            const Icon = filterOptions.find(f => f.id === filter)!.icon;
                                            return <Icon className="text-purple-600 text-xl" />;
                                        })()
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {filterOptions.find(f => f.id === filter)?.label}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {posts.length} bài viết
                                    </p>
                                </div>
                            </div>
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </div>

                        {/* Posts */}
                        {posts.length > 0 ? (
                            <div className="space-y-4">
                                {posts.map((post: any) => (
                                    <ArticleCard key={post.articleId} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ArticleIcon className="text-4xl text-purple-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {searchQuery ? "Không tìm thấy kết quả" : "Chưa có bài viết"}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        {searchQuery 
                                            ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                                            : "Hãy là người đầu tiên chia sẻ kiến thức với cộng đồng!"
                                        }
                                    </p>

                                    <Link to="/community/write">
                                        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-sm font-semibold">
                                            <AddCircleIcon className="text-xl" />
                                            <span>Viết bài đầu tiên</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Load More */}
                        {data?.items && data.items.length > 0 && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setPage(page + 1)}
                                    className="px-8 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-purple-300 hover:bg-purple-50 transition-all text-sm shadow-sm"
                                >
                                    Xem thêm bài viết
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}