import { api, type ApiEnvelope } from "../../api/api";
import type {
  AuthUser,
  Credentials,
  RegistrationInput,
  UpdateUserInput,
  UserProfile,
} from "./types";

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthUser, RegistrationInput>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<AuthUser>) => response.data,
    }),
    login: builder.mutation<AuthUser, Credentials>({
      query: (body) => ({ url: "/auth/logIn", method: "POST", body }),
      transformResponse: (response: ApiEnvelope<{ user: AuthUser }>) =>
        response.data.user,
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      transformResponse: (response: ApiEnvelope<{ message: string }>) =>
        response.data,
    }),
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiEnvelope<UserProfile>) => response.data,
      providesTags: ["Auth"],
    }),
    updateUser: builder.mutation<UserProfile, UpdateUserInput>({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      transformResponse: (response: ApiEnvelope<UserProfile>) => response.data,
      invalidatesTags: ["Auth"],
    }),
    deleteUser: builder.mutation<AuthUser, void>({
      query: () => ({ url: "/auth/me", method: "DELETE" }),
      transformResponse: (response: ApiEnvelope<AuthUser>) => response.data,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = authApi;
