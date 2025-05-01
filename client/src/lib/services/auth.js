import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL + "/api/user/",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    headers.set("Content-Type", "application/json");
    // Add Authorization header from localStorage
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    console.log("Attempting token refresh...");

    // Trigger backend's accessTokenAutoRefresh by calling /me
    const refreshResult = await baseQuery(
      {
        url: "me",
        method: "GET",
        credentials: "include",
      },
      api,
      extraOptions
    );

    if (refreshResult.data && refreshResult.data.success) {
      console.log("Refresh successful:", refreshResult.data);
      // Store new accessToken from response (assuming backend sets it in cookies)
      const newAccessToken = localStorage.getItem("accessToken"); // Updated by setTokensCookies
      if (newAccessToken) {
        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.error("Refresh succeeded but no new accessToken found");
      }
    } else {
      console.error("Refresh failed:", refreshResult.error || "No data returned");
      // Clear tokens and log out
      localStorage.removeItem("accessToken");
      await baseQuery(
        { url: "logout", method: "POST", credentials: "include" },
        api,
        extraOptions
      );
      // Dispatch action to reset auth state (optional, requires auth slice)
      api.dispatch({ type: "auth/logout" });
      // Redirect to login (requires Next.js router in component)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
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
      transformResponse: (response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return response;
      },
    }),

    verifyPhone: builder.mutation({
      query: (data) => ({
        url: "verify-phone",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return response;
      },
    }),

    verifyEmail: builder.mutation({
      query: (data) => ({
        url: "verify-email",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return response;
      },
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return {
          ...response,
          user: response.user
            ? {
                ...response.user,
                isGISRegistered: response.user.isGISRegistered ?? false,
              }
            : null,
        };
      },
      invalidatesTags: ["User"],
    }),

    getUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return {
          ...response,
          user: response.user
            ? {
                ...response.user,
                isGISRegistered: response.user.isGISRegistered ?? false,
                status: response.user.status || "pending",
              }
            : null,
        };
      },
      providesTags: ["User"],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
      transformResponse: (response) => {
        localStorage.removeItem("accessToken");
        return response;
      },
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
        url: "me", // Use /me to trigger accessTokenAutoRefresh
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return response;
      },
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