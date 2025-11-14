import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PagingParam } from '../types/TableParam';
import {
    AddCourseRequest,
    Course,
    UpdateCourseRequest,
    GetAllCourse,
    CountStudentPerCourse,
    CourselistPaginationRespone,
    CourselistPaginationRequest,
} from '../types/Course.type';

export const coursesApi = createApi({
    reducerPath: 'coursesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://localhost:7005/',
        prepareHeaders: (headers, _) => {
            // Thêm logic để lấy accessToken từ localStorage và đặt vào header Authorization
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                const accessToken = userData ? userData.accessToken : null;
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    refetchOnMountOrArgChange: true,
    endpoints: (build) => ({
        getCoursesBaseStudentJoined: build.query<Course[], number>({
            query: (number: number) =>
                `api/Course/TopFavoritesCourseBaseStudentJoined?numberOfCourses=${number}`,
        }),
        getCourseID: build.query<Course, string>({
            query: (id) => `api/Course/GetCourseDetailById/${id}`,
            transformResponse: (response: any) => {
                // ✅ bóc đúng dữ liệu ra
                if (response?.dataObject) return response.dataObject; // admin case
                return response; // teacher case (trả thẳng object)
            },
        }),

        getCoursesBaseRating: build.query<Course[], number>({
            query: (number: number) =>
                `api/Course/TopFavoritesCourseBaseRating?numberOfCourses=${number}`,
        }),
        getCoursesBaseSales: build.query<Course[], number>({
            query: (number: number) =>
                `api/Course/TopFavoritesCourseBaseSales?numberOfCourses=${number}`,
        }),

        addNewCourse: build.mutation<Course, AddCourseRequest>({
            query: (body: AddCourseRequest) => ({
                url: 'api/Course/AddCourse',
                body,
                method: 'post',
            }),
            transformResponse: (response) => {
                const data = (response as any).dataObject;
                return {
                    ...data,
                };
            },
        }),
        updateCourse: build.mutation<Course, UpdateCourseRequest>({
            query: (body: UpdateCourseRequest) => ({
                url: 'api/Course/UpdateCourse',
                body,
                method: 'put',
            }),
            transformResponse: (response) => {
                const data = (response as any).dataObject;
                return {
                    ...data,
                };
            },
        }),

        // course.services.ts (thêm endpoint vào builder)
        publishCourse: build.mutation({
            query: ({ courseId, isActive }: { courseId: number; isActive: boolean }) => ({
                url: `api/Course/publish/${courseId}`,    // hoặc `/courses/publish/${courseId}` tùy base route
                method: "PUT",
                body: { isActive },
            }),
        }),

        getAllCourses: build.query<GetAllCourse, PagingParam>({
            query: (input: PagingParam) =>
                `api/Course/CourselistPagination?pageNumber=${input.pageNumber}&pageSize=${input.pageSize}&search=${input.search}`,
        }),
        deleteCourse: build.mutation<Course, number>({
            query: (id) => ({
                url: `api/Course/DeleteCourse?courseId=${id}`,
                method: 'delete',
            }),
        }),
        countTotalCourses: build.query<number, void>({
            query: () => 'api/Course/CountTotalCourse',
            transformResponse: (response) => {
                const data = (response as any).dataObject;
                return data;
            },
        }),
        countStudentPerCourse: build.query<CountStudentPerCourse[], void>({
            query: () => 'api/Course/CountStudentPerCourse',
            transformResponse: (response) => {
                const data = (response as any).dataObject;
                return [...data];
            },
        }),
        getCoursesByTeacher: build.query<Course[], string>({
            query: (teacherId) => `api/Course/GetCoursesByTeacher?teacherId=${teacherId}`,
        }),

        getStudentsInMyCourse: build.query<any[], number>({
            query: (courseId: number) => `api/Course/GetStudentsInMyCourse/${courseId}`,
        }),
        getStudentsInMyCourses: build.query<any[], { courseIds: number[]; teacherId: string }>({
            query: ({ courseIds, teacherId }) => ({
                url: `api/Course/GetStudentsInMyCourses?teacherId=${teacherId}`,
                method: 'POST',
                body: courseIds,
            }),
        }),


        getCourselistPagination: build.query<
            CourselistPaginationRespone,
            CourselistPaginationRequest
        >({
            query: (input) => {
                const params = new URLSearchParams();

                if (input.minPrice) params.append('MinPrice', input.minPrice.toString());
                if (input.maxPrice) params.append('MaxPrice', input.maxPrice.toString());
                if (input.pageNumber) params.append('PageNumber', input.pageNumber.toString());
                if (input.pageSize) params.append('PageSize', input.pageSize.toString());

                input.categoryIds?.forEach((id) => params.append('CategoryIds', id.toString()));

                return {
                    url: `api/Course/CourselistPagination?${params.toString()}`,
                    method: 'get',
                };
            },
        }),
    }),
});

export const {
    useGetCoursesBaseStudentJoinedQuery,
    useGetCourseIDQuery,
    useGetCoursesBaseRatingQuery,
    useGetCoursesBaseSalesQuery,
    useAddNewCourseMutation,
    useUpdateCourseMutation,
    useGetAllCoursesQuery,
    useDeleteCourseMutation,
    useCountTotalCoursesQuery,
    useCountStudentPerCourseQuery,
    useGetCourselistPaginationQuery,
    useGetCoursesByTeacherQuery,
    useGetStudentsInMyCourseQuery,
    useGetStudentsInMyCoursesQuery,
    usePublishCourseMutation,
} = coursesApi;
