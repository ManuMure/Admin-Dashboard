// client/src/state/api.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BASE_URL }),
  reducerPath: "adminApi",
  // Add "Tasks" and "Users" to tagTypes for cache invalidation
  tagTypes: ["User", "Products", "Customers", "Transactions", "Geography", "Sales", "Admins", "Performance", "Dashboard", "Tasks", "Users"],
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
    getProducts: build.query({
      query: () => "client/products",
      providesTags: ["Products"],
    }),
    getCustomers: build.query({
      query: () => "client/customers",
      providesTags: ["Customers"],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: "client/transactions",
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),
    getGeography: build.query({
      query: () => "client/geography",
      providesTags: ["Geography"],
    }),
    getSales: build.query({
      query: () => "sales/sales",
      providesTags: ["Sales"],
    }),
    getAdmins: build.query({
      query: () => "management/admins",
      providesTags: ["Admins"],
    }),
    getUserPerformance: build.query({
      query: (id) => `management/performance/${id}`,
      providesTags: ["Performance"],
    }),
    getDashboard: build.query({
      query: () => "general/dashboard",
      providesTags: ["Dashboard"],
    }),

    // --- New Task Endpoints ---
    getTasks: build.query({
      query: ({ page, pageSize, sort, search, statusFilter, assignedToFilter, priorityFilter, dueDateStart, dueDateEnd }) => ({
        url: "tasks/tasks", // Matches your backend route: /tasks/tasks
        method: "GET",
        params: { page, pageSize, sort, search, statusFilter, assignedToFilter, priorityFilter, dueDateStart, dueDateEnd },
      }),
      providesTags: ["Tasks"],
    }),
    createTask: build.mutation({
      query: (body) => ({
        url: "tasks/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation({
      query: ({ id, ...body }) => ({
        url: `tasks/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: build.mutation({
      query: (id) => ({
        url: `tasks/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),

    // --- New User For Assignment Endpoint ---
    getUsersForAssignment: build.query({
      query: () => "tasks/users-for-assignment", // Matches new backend route
      providesTags: ["Users"], // Tag specifically for users for assignment
    }),

    // --- New Comment Endpoints ---
    addCommentToTask: build.mutation({
      query: ({ id, userId, text }) => ({
        url: `tasks/tasks/${id}/comments`,
        method: "POST",
        body: { userId, text },
      }),
      invalidatesTags: ["Tasks"], // Invalidate Tasks to refetch the task with new comment
    }),
    deleteCommentFromTask: build.mutation({
      query: ({ taskId, commentId }) => ({
        url: `tasks/tasks/${taskId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"], // Invalidate Tasks to refetch the task with comment removed
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetSalesQuery,
  useGetAdminsQuery,
  useGetUserPerformanceQuery,
  useGetDashboardQuery,

  // Export new Task hooks
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  // Export new User For Assignment hook
  useGetUsersForAssignmentQuery,

  // Export new Comment hooks
  useAddCommentToTaskMutation,
  useDeleteCommentFromTaskMutation,
} = api;