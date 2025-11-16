import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AverageRating } from '../types/RatingCourse.type';

export const ratingCourseApi = createApi({
    reducerPath: 'ratingCourseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://localhost:7005/',
        prepareHeaders: (headers) => {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                const accessToken = userData?.accessToken;
                if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    refetchOnMountOrArgChange: true,

    endpoints: (build) => ({

        // ⭐ Lấy điểm trung bình + số lượng đánh giá
        getRatingCourse: build.query<AverageRating, number>({
            query: (courseId: number) => `api/RatingCourse/ViewCourseRating/${courseId}`,
            transformResponse: (response: {
                averageRating: { averageRating: number; ratingCount: number };
            }) => ({
                averageRating: response.averageRating.averageRating,
                ratingCount: response.averageRating.ratingCount,
            }),
        }),

        // ⭐ Lấy danh sách đánh giá (API mới bạn sẽ thêm ở backend)
        getRatingList: build.query<any[], number>({
            query: (courseId: number) => `api/RatingCourse/List/${courseId}`,
        }),

        // ⭐ Gửi đánh giá khóa học
        //   Lưu ý: API backend yêu cầu truyền QueryString
        //   POST /api/RatingCourse/RatingCourse?RatingStar=5&CommentContent=abc&registrationId=10
        addRatingCourse: build.mutation<
            any,
            { rating: number; comment: string; registrationId: number }
        >({
            query: ({ rating, comment, registrationId }) => ({
                url: `api/RatingCourse/RatingCourse`,
                method: 'POST',
                params: {
                    RatingStar: rating,
                    CommentContent: comment,
                    registrationId: registrationId,
                },
            }),
        }),
    }),
});

export const {
    useGetRatingCourseQuery,
    useGetRatingListQuery,
    useAddRatingCourseMutation,
} = ratingCourseApi;
