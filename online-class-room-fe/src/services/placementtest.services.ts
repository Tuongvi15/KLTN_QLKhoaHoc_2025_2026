import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Field,
  AddFieldRequest,
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
  tagTypes: ["Field", "PlacementTest", "PlacementQuestion"],
  endpoints: (build) => ({
    // ---------- FIELD ----------
    getAllFields: build.query<Field[], void>({
      query: () => "api/PlacementTest/fields",
      providesTags: ["Field"],
    }),
    addField: build.mutation<Field, AddFieldRequest>({
      query: (body) => ({
        url: "api/PlacementTest/fields",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Field"],
    }),
    deleteField: build.mutation<void, number>({
      query: (id) => ({
        url: `api/PlacementTest/fields/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Field"],
    }),
    updateField: build.mutation({
      query: (body) => ({
        url: 'api/PlacementTest/UpdateField',
        method: 'PUT',
        body,
      }),
    }),


    // ---------- PLACEMENT TEST ----------
    getAllPlacementTests: build.query<PlacementTest[], void>({
      query: () => "api/PlacementTest/tests",
      providesTags: ["PlacementTest"],
    }),
    addPlacementTest: build.mutation<PlacementTest, AddPlacementTestRequest>({
      query: (body) => ({
        url: "api/PlacementTest/tests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlacementTest"],
    }),
    updatePlacementTest: build.mutation<PlacementTest, UpdatePlacementTestRequest>({
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
    getCategoriesByFieldId: build.query({
      query: (fieldId: number) => ({
        url: `api/Category/by-field/${fieldId}`,
        method: "GET",
      }),
    }),

    getTestsByField: build.query<any[], { fieldId: number; accountId: string }>({
      query: ({ fieldId, accountId }) =>
        `api/PlacementTest/tests/field/${fieldId}?accountId=${accountId}`,
    }),

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


    // ---------- QUESTIONS ----------
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

export const {
  useGetAllFieldsQuery,
  useAddFieldMutation,
  useDeleteFieldMutation,
  useGetAllPlacementTestsQuery,
  useAddPlacementTestMutation,
  useUpdatePlacementTestMutation,
  useDeletePlacementTestMutation,
  useGetQuestionsByTestIdQuery,
  useAddPlacementQuestionMutation,
  useUpdatePlacementQuestionMutation,
  useDeletePlacementQuestionMutation,
  useUpdateFieldMutation,
  useGetCategoriesByFieldIdQuery,
  useGetTestsByFieldQuery,
  useSavePlacementResultMutation,
  useGetAllResultsByAccountQuery ,
} = placementTestApi;
