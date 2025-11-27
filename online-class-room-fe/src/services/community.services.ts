// src/services/community.services.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const communityApi = createApi({
    reducerPath: 'communityApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://localhost:7005/',
        prepareHeaders: (headers) => {
            const user = localStorage.getItem('user');
            if (user) {
                const { accessToken } = JSON.parse(user);
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    refetchOnMountOrArgChange: true,
    endpoints: (build) => ({
        // 🔹 Lấy danh sách bài viết public
        getArticles: build.query<any, { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 10 }) =>
                `api/community/articles/public?page=${page}&pageSize=${pageSize}`,
        }),

        // 🔹 Lấy chi tiết bài viết
        getArticleDetail: build.query<any, number>({
            query: (id) => `api/community/article/${id}`,
        }),

        // 🔹 Tạo bài viết (DRAFT)
        createArticle: build.mutation<any, { title: string; contentHtml?: string; coverImageUrl?: string }>({
            query: (body) => ({
                url: `api/community/article`,
                method: 'POST',
                body,
            }),
        }),

        // 🔹 Publish bài viết
        publishArticle: build.mutation<any, number>({
            query: (id) => ({
                url: `api/community/article/${id}/publish`,
                method: 'POST',
            }),
        }),

        // 🔹 Update bài Draft
        updateDraft: build.mutation<any, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `api/community/article/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),

        // 🔹 Lấy danh sách Draft
        getMyDrafts: build.query<any, { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 10 }) =>
                `api/community/articles/my-drafts?page=${page}&pageSize=${pageSize}`,
        }),

        // 🔹 Like / Unlike
        likeArticle: build.mutation<any, number>({
            query: (id) => ({
                url: `api/community/article/${id}/like`,
                method: 'POST',
            }),
        }),

        // 🔹 Lấy danh sách bình luận
        getComments: build.query<any, number>({
            query: (id) => `api/community/article/${id}/comments`,
        }),

        // 🔹 Gửi bình luận
        commentArticle: build.mutation<any, { id: number; content: string }>({
            query: ({ id, content }) => ({
                url: `api/community/article/${id}/comment`,
                method: 'POST',
                body: { content },
            }),
        }),

        // 🔹 Upload hình ảnh (cover / editor)
        uploadImage: build.mutation<{ url: string }, FormData>({
            query: (form) => ({
                url: `api/upload`,
                method: 'POST',
                body: form,
            }),
        }),

        // 🔹 ADMIN – danh sách bài block
        getBlockedArticles: build.query<any, { page?: number; pageSize?: number }>({
            query: ({ page = 1, pageSize = 10 }) =>
                `api/community/articles/blocked?page=${page}&pageSize=${pageSize}`,
        }),

        // 🔹 ADMIN – mở block
        unblockArticle: build.mutation<any, number>({
            query: (id) => ({
                url: `api/community/article/${id}/unblock`,
                method: 'POST',
            }),
        }),

        // 🔹 ADMIN – block bài viết
        blockArticle: build.mutation<any, { id: number; reason: string }>({
            query: ({ id, reason }) => ({
                url: `api/community/article/${id}/block`,
                method: 'POST',
                body: { reason },
            }),
        }),
    }),
});

// Export hooks
export const {
    useGetArticlesQuery,
    useGetArticleDetailQuery,
    useCreateArticleMutation,
    usePublishArticleMutation,
    useUpdateDraftMutation,
    useGetMyDraftsQuery,
    useLikeArticleMutation,
    useGetCommentsQuery,
    useCommentArticleMutation,
    useUploadImageMutation,
    useGetBlockedArticlesQuery,
    useUnblockArticleMutation,
    useBlockArticleMutation,
} = communityApi;
