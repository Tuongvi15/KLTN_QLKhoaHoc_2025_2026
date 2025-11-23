import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  PlacementTest,
  AddPlacementTestRequest,
  UpdatePlacementTestRequest,
  PlacementQuestion,
  AddPlacementQuestionRequest
} from "../types/PlacementTest.type";

export const placementTestApi = createApi({
  reducerPath: "placementTestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://localhost:7005/",
    prepareHeaders: (headers) => {
      const user = localStorage.getItem("user");
      if (user) {
        const token = JSON.parse(user)?.accessToken;
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Category", "PlacementTest", "PlacementQuestion"],
  endpoints: (build) => ({

    // ==================== CATEGORY ====================
    getAllCategories: build.query<any[], void>({
      query: () => "api/Category/GetAllCategory",
      providesTags: ["Category"],
    }),

    // ==================== PLACEMENT TEST ====================
    getAllPlacementTests: build.query<PlacementTest[], void>({
      query: () => "api/PlacementTest/tests",
      providesTags: ["PlacementTest"],
    }),

    addPlacementTest: build.mutation<any, AddPlacementTestRequest>({
      query: (body) => ({
        url: "api/PlacementTest/tests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlacementTest"],
    }),

    updatePlacementTest: build.mutation<any, UpdatePlacementTestRequest>({
      query: (body) => ({
        url: `api/PlacementTest/tests/${body.placementTestId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PlacementTest"],
    }),

    deletePlacementTest: build.mutation<void, number>({
      query: (id) => ({
        url: `api/PlacementTest/tests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PlacementTest"],
    }),

    // ---------- GET TESTS BY CATEGORY ----------
    getTestsByCategory: build.query<any[], { categoryId: number; accountId: string }>({
      query: ({ categoryId, accountId }) =>
        `api/PlacementTest/tests/category/${categoryId}?accountId=${accountId}`,
    }),

    // ==================== RESULT ====================
    savePlacementResult: build.mutation<any, any>({
      query: (body) => ({
        url: `api/PlacementTest/results`,
        method: "POST",
        body,
      }),
    }),

    getAllResultsByAccount: build.query<any[], string>({
      query: (accountId) => `api/PlacementTest/results/history/${accountId}`,
    }),

    // ==================== QUESTIONS ====================
    getQuestionsByTestId: build.query<PlacementQuestion[], number>({
      query: (id) => `api/PlacementTest/questions/${id}`,
      providesTags: ["PlacementQuestion"],
    }),

    addPlacementQuestion: build.mutation<PlacementQuestion, AddPlacementQuestionRequest>({
      query: (body) => ({
        url: "api/PlacementTest/questions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlacementQuestion"],
    }),

    updatePlacementQuestion: build.mutation<
      PlacementQuestion,
      { questionId: number } & AddPlacementQuestionRequest
    >({
      query: ({ questionId, ...body }) => ({
        url: `api/PlacementTest/questions/${questionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PlacementQuestion"],
    }),

    deletePlacementQuestion: build.mutation<void, number>({
      query: (id) => ({
        url: `api/PlacementTest/questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PlacementQuestion"],
    }),
  }),
});

// Export hooks
export const {
  useGetAllCategoriesQuery,
  useGetAllPlacementTestsQuery,
  useAddPlacementTestMutation,
  useUpdatePlacementTestMutation,
  useDeletePlacementTestMutation,
  useGetTestsByCategoryQuery,
  useSavePlacementResultMutation,
  useGetAllResultsByAccountQuery,
  useGetQuestionsByTestIdQuery,
  useAddPlacementQuestionMutation,
  useUpdatePlacementQuestionMutation,
  useDeletePlacementQuestionMutation,
} = placementTestApi;
