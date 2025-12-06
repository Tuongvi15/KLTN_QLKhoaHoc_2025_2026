import { useState, useMemo, useRef, useEffect } from "react";
import { useAppSelector } from "../../hooks/appHook";
import { useGetArticlesQuery } from "../../services/community.services";
import ArticleCard from "../../components/Community/ArticleCard";

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArticleIcon from '@mui/icons-material/Article';
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
// ⭐ Skeleton component
function SkeletonPost() {
    return (
        <div className="animate-pulse bg-white border border-gray-200 rounded-md p-4">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
    );
}

export default function CommunityListPage() {
    const [filter, setFilter] = useState("new");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const navigate = useNavigate();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const auth = localStorage.getItem("auth");
    const authUser = auth ? JSON.parse(auth) : null;
    const persistRoot = sessionStorage.getItem("persist:root");

    let isLoggedIn = false;

    try {
        const persistData = sessionStorage.getItem("persist:root");
        if (persistData) {
            const root = JSON.parse(persistData);
            const auth = JSON.parse(root.auth ?? "{}");
            isLoggedIn = auth.isLogin === true;
        }
    } catch (err) {
        console.error("Parse auth error:", err);
    }
    const { data, isLoading, isFetching } = useGetArticlesQuery(
        { page, pageSize: 10 },
        {
            refetchOnMountOrArgChange: false,
            refetchOnReconnect: false,
            refetchOnFocus: false,
        }
    );

    const handleWritePost = () => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
        } else {
            navigate("/community/write");
        }
    };
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // ⭐ Append data vào allPosts
    useEffect(() => {
        if (!data) return;

        if (data.items?.length === 0) {
            setHasMore(false);
        } else {
            setAllPosts(prev => {
                const newItems = data.items.filter(
                    (item: any) => !prev.some((p) => p.articleId === item.articleId)
                );
                return [...prev, ...newItems];
            });

        }
    }, [data]);

    // ⭐ Infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetching && hasMore) {
                    setPage((p) => p + 1);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMore, isFetching]);

    // ⭐ Filter + Search + Sort
    const posts = useMemo(() => {
        let result = [...allPosts];

        if (searchQuery.trim()) {
            result = result.filter((p) =>
                (p.title ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.excerpt ?? "").toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filter === "new") {
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (filter === "hot") {
            result.sort((a, b) => b.totalLikes - a.totalLikes);
        } else if (filter === "trending") {
            result.sort(
                (a, b) =>
                    (b.totalLikes + b.totalComments) -
                    (a.totalLikes + a.totalComments)
            );
        }

        return result;
    }, [allPosts, filter, searchQuery]);

    const filterOptions = [
        { id: "new", label: "Mới nhất", icon: NewReleasesIcon },
        { id: "trending", label: "Thịnh hành", icon: TrendingUpIcon },
        { id: "hot", label: "Hot", icon: LocalFireDepartmentIcon },
        { id: "following", label: "Đang theo dõi", icon: FavoriteIcon },
    ];

    // ⭐ Loading trang đầu
    if (isLoading && page === 1) {
        return (
            <div className="p-6 space-y-4 max-w-4xl mx-auto">
                {[1, 2, 3, 4].map((i) => <SkeletonPost key={i} />)}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">

            {/* ⭐ Header giữ nguyên */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Cộng đồng</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Chia sẻ kiến thức và kết nối cùng nhau
                            </p>
                        </div>

                        <button
                            onClick={handleWritePost}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white"
                            style={{ backgroundColor: '#00497c' }}
                        >
                            <AddCircleIcon /> Viết bài
                        </button>

                    </div>

                    {/* Search giữ nguyên */}
                    <div className="relative max-w-3xl">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-900"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

                {/* ⭐ SIDEBAR (KHÔNG BỊ MẤT NỮA) */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-28 space-y-6">

                        {/* Filter Card giữ nguyên */}
                        <div className="border border-gray-300">
                            <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
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

                        {/* Stats giữ nguyên */}
                        <div className="border border-gray-300">
                            <div className="px-4 py-3 border-b border-gray-300 bg-gray-50">
                                <h3 className="font-bold text-gray-900 text-sm">THỐNG KÊ</h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 font-medium">Tổng bài viết</span>
                                    <span className="text-2xl font-bold" style={{ color: '#00497c' }}>
                                        {data?.totalCount || allPosts.length}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-300"></div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 font-medium">Mới hôm nay</span>
                                    <span className="text-2xl font-bold" style={{ color: '#00497c' }}>12</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </aside>

                {/* ⭐ MAIN CONTENT */}
                <main className="flex-1 min-w-0">

                    {/* Posts */}
                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <ArticleCard key={post.articleId} post={post} />
                            ))
                        ) : (
                            <div className="bg-white border-2 border-gray-200 p-12 text-center">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                        <ArticleIcon className="text-4xl text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Không tìm thấy kết quả
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Thử từ khóa khác hoặc xóa bộ lọc.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ⭐ Skeleton khi tải thêm */}
                    {isFetching && (
                        <div className="mt-6 space-y-4">
                            <SkeletonPost />
                            <SkeletonPost />
                        </div>
                    )}

                    {/* ⭐ Infinite scroll target */}
                    {hasMore && <div ref={loadMoreRef} className="h-12"></div>}

                    {/* ⭐ Hết bài viết */}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center py-8 text-gray-500 font-medium">
                            🎉 Đã tải tất cả bài viết
                        </div>
                    )}
                </main>
            </div><Modal
                open={showLoginModal}
                onCancel={() => setShowLoginModal(false)}
                footer={null}
                centered
            >
                <h2 className="text-xl font-bold mb-2">Bạn cần đăng nhập</h2>
                <p className="text-gray-600 mb-4">Hãy đăng nhập để đăng bài vào cộng đồng.</p>

                <button
                    className="w-full py-2 font-bold text-white"
                    style={{ backgroundColor: "#00497c" }}
                    onClick={() => {
                        // redirect về lại trang hiện tại sau login
                        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                    }}
                >
                    Đăng nhập ngay
                </button>
            </Modal>

        </div>

    );
}
