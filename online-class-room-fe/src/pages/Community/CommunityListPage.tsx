// src/pages/Community/CommunityListPage.tsx
import { useState, useMemo, useRef, useEffect } from "react";
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
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((prev) => prev + 1); // ⬅ auto tăng page
                }
            },
            { threshold: 1 }
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, []);
const [allPosts, setAllPosts] = useState<any[]>([]);

useEffect(() => {
    if (data?.items) {
        setAllPosts(prev => [...prev, ...data.items]);
    }
}, [data]);

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
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header - Udemy Style */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Cộng đồng
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">Chia sẻ kiến thức và kết nối cùng nhau</p>
                        </div>

                        {/* Nút tạo bài viết */}
                        <Link to="/community/write">
                            <button
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all"
                                style={{ backgroundColor: '#00497c' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#003d66'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00497c'}
                            >
                                <AddCircleIcon className="text-xl" />
                                <span>Viết bài</span>
                            </button>
                        </Link>
                    </div>

                    {/* Search Bar - Udemy Style */}
                    <div className="relative max-w-3xl">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết, chủ đề hoặc tác giả..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-900 text-sm font-medium focus:outline-none focus:border-gray-900"
                            style={{ borderRadius: '0' }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Sidebar - Udemy Style */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-28 space-y-6">
                            {/* Filter Card */}
                            <div className="border border-gray-300">
                                <div className="px-4 py-3 border-b border-gray-300" style={{ backgroundColor: '#f7f9fa' }}>
                                    <h2 className="font-bold text-gray-900 text-sm">BỘ LỌC</h2>
                                </div>
                                <div className="p-2">
                                    {filterOptions.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setFilter(id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${filter === id
                                                ? "text-white font-bold"
                                                : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                            style={filter === id ? { backgroundColor: '#00497c' } : {}}
                                        >
                                            <Icon className="text-lg" />
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="border border-gray-300">
                                <div className="px-4 py-3 border-b border-gray-300" style={{ backgroundColor: '#f7f9fa' }}>
                                    <h3 className="font-bold text-gray-900 text-sm">THỐNG KÊ</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700 font-medium">Tổng bài viết</span>
                                        <span className="text-2xl font-bold" style={{ color: '#00497c' }}>{data?.totalCount || 0}</span>
                                    </div>
                                    <div className="h-px bg-gray-300"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700 font-medium">Mới hôm nay</span>
                                        <span className="text-2xl font-bold" style={{ color: '#00497c' }}>12</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="border border-gray-300">
                                <div className="px-4 py-3 border-b border-gray-300" style={{ backgroundColor: '#f7f9fa' }}>
                                    <h3 className="font-bold text-gray-900 text-sm">KHÁM PHÁ</h3>
                                </div>
                                <div className="p-2">
                                    <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                                        🔥 Chủ đề hot
                                    </button>
                                    <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                                        ⭐ Tác giả nổi bật
                                    </button>
                                    <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                                        📚 Danh mục
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Mobile Filter Pills */}
                        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
                            {filterOptions.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setFilter(id)}
                                    className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap transition-colors text-sm font-bold border-2 ${filter === id
                                        ? "text-white border-transparent"
                                        : "bg-white text-gray-700 border-gray-900 hover:bg-gray-100"
                                        }`}
                                    style={filter === id ? { backgroundColor: '#00497c' } : {}}
                                >
                                    <Icon className="text-lg" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Filter Info Banner */}
                        <div className="mb-6 flex items-center justify-between bg-gray-50 border border-gray-300 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: '#00497c' }}>
                                    {filterOptions.find(f => f.id === filter)?.icon &&
                                        (() => {
                                            const Icon = filterOptions.find(f => f.id === filter)!.icon;
                                            return <Icon className="text-white text-xl" />;
                                        })()
                                    }
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
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
                                    className="text-xs font-bold hover:underline"
                                    style={{ color: '#00497c' }}
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
                            <div className="bg-white border-2 border-gray-200 p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <ArticleIcon className="text-4xl text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {searchQuery ? "Không tìm thấy kết quả" : "Chưa có bài viết"}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        {searchQuery
                                            ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                                            : "Hãy là người đầu tiên chia sẻ kiến thức với cộng đồng!"
                                        }
                                    </p>

                                    <Link to="/community/write">
                                        <button
                                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-colors"
                                            style={{ backgroundColor: '#00497c' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#003d66'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00497c'}
                                        >
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
                                    className="px-8 py-3 border-2 border-gray-900 font-bold hover:bg-gray-100 transition-colors text-sm"
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