import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/api/user/",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // You can add any custom headers here if needed
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If 401 Unauthorized, try to refresh token
  if (result.error?.status === 401) {
    console.log("Attempting token refresh...");
    const refreshResult = await baseQuery(
      {
        url: "refresh-token",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - logout the user
      await baseQuery({ url: "logout", method: "POST" }, api, extraOptions);
      // You can dispatch a logout action here if needed
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (user) => ({
        url: "register",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["User"],
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
      invalidatesTags: ["User"],
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
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
      invalidatesTags: ["User"],
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
              status: response.user.status || "pending",
            }
          : null,
      }),
      providesTags: ["User"],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    resetPasswordLink: builder.mutation({
      query: (email) => ({
        url: "send-password-reset-email",
        method: "POST",
        body: { email },
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

    refreshToken: builder.mutation({
      query: () => ({
        url: "refresh-token",
        method: "POST",
      }),
    }),

    applyApproval: builder.mutation({
      query: () => ({
        url: "apply-approval",
        method: "POST",
      }),
      invalidatesTags: ["User"],
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
  useRefreshTokenMutation,
  useApplyApprovalMutation,
} = authApi;