import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface PaginationParam {
    pageNumber: number;
    pageSize: number;
    search?: string;
}

export const reportProblemApi = createApi({
    reducerPath: "reportProblemApi",

    baseQuery: fetchBaseQuery({
        baseUrl: 'https://qlkhtt-backend-production.up.railway.app/',
        prepareHeaders: (headers) => {
            const user = localStorage.getItem("user");

            if (user) {
                const userData = JSON.parse(user);
                const accessToken = userData ? userData.accessToken : null;
                headers.set("Authorization", `Bearer ${accessToken}`);
            }

            return headers;
        },
    }),

    refetchOnMountOrArgChange: true,

    endpoints: (build) => ({
        // ===============================
        // 🔹 1. Lấy danh sách report
        // ===============================
        getAllReports: build.query<any, PaginationParam>({
            query: (input) =>
                `api/ReportProblem/GetAllRequest?pageNumber=${input.pageNumber}&pageSize=${input.pageSize}&search=${input.search ?? ""}`,

            transformResponse: (response: any, meta: any) => {
                const pagination = meta?.response?.headers.get("X-Pagination")
                    ? JSON.parse(meta.response.headers.get("X-Pagination")!)
                    : null;

                return {
                    data: response,        // array reportProblemListDto
                    pagination: pagination // object { TotalCount, PageSize, ... }
                };
            }
        }),

        sendReport: build.mutation<any, {
            type: "Article" | "Comment",
            title: string,
            description: string,
            articleId?: number,
            commentId?: number,
            accountId: string
        }>({
            query: (body) => ({
                url: "api/ReportProblem/SendRequest",
                method: "POST",
                body,
            }),
            transformResponse: (response: any) => response,
        }),
        // ===============================
        // 🔹 2. Lấy chi tiết report
        // ===============================
        getReportDetail: build.query<any, number>({
            query: (reportId) => `api/ReportProblem/Detail/${reportId}`,
            transformResponse: (response: any) => response,
        }),

        // ===============================
        // 🔹 3. Xử lý report (delete / reject)
        // ===============================
        resolveReport: build.mutation<
            any,
            { reportId: number; status: string; adminResponse?: string }
        >({
            query: (body) => ({
                url: "api/ReportProblem/ResolveRequest",
                method: "PUT",
                body,
            }),
            transformResponse: (response: any) => response,
        }),
    }),
});

// =======================================================
// 🔥 Export hooks để FE sử dụng
// =======================================================
export const {
    useGetAllReportsQuery,
    useGetReportDetailQuery,
    useResolveReportMutation,
    useSendReportMutation,
} = reportProblemApi;
