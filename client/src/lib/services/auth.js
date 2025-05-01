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

  if (result.error?.status === 401) {
    console.log("Attempting token refresh...");
    const refreshResult = await baseQuery(
      {
        url: "refresh-token",
        method: "POST",
        credentials: "include", // Ensure credentials are included
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      console.log("Refresh successful:", refreshResult.data); // Debug refresh result
      result = await baseQuery(args, api, extraOptions); // Retry original request
    } else {
      console.error("Refresh failed:", refreshResult.error); // Debug refresh failure
      await baseQuery({ url: "logout", method: "POST", credentials: "include" }, api, extraOptions);
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