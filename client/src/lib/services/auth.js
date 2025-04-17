import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/api/user/",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (user) => ({
        url: "register",
        method: "POST",
        body: user,
      }),
    }),

    verifyPhone: builder.mutation({
      query: (data) => ({
        url: "verify-phone",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmail: builder.mutation({
      query: (data) => ({
        url: "verify-email",
        method: "POST",
        body: data,
      }),
    }),

    loginUser: builder.mutation({
      query: (user) => ({
        url: "login",
        method: "POST",
        body: user,
      }),
      transformResponse: (response) => ({
        ...response,
        user: response.user
          ? {
              ...response.user,
              isGISRegistered: response.user.isGISRegistered ?? false,
            }
          : null,
      }),
    }),

    getUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
      }),
      transformResponse: (response) => ({
        ...response,
        user: response.user
          ? {
              ...response.user,
              isGISRegistered: response.user.isGISRegistered ?? false,
            }
          : null,
      }),
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
    }),

    resetPasswordLink: builder.mutation({
      query: (data) => ({
        url: "send-password-reset-email",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ id, token, ...values }) => ({
        url: `reset-password/${id}/${token}`,
        method: "POST",
        body: values,
      }),
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: "change-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useVerifyPhoneMutation,
  useVerifyEmailMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useLogoutUserMutation,
  useResetPasswordLinkMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
