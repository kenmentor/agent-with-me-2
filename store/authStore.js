import { create } from "zustand";

import { persist } from "zustand/middleware";
import Req from "@/app/utility/axois";
import { toast } from "sonner";

const { app, base } = Req;
// Axios instance

// URL constants
//const base = "http://localhost:5036/v1";

// Zustand Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isCheckingAuth: true,

      // SIGNUP
      signup: async (object) => {
        set({ isLoading: true, error: null });
        try {
          const response = await app.post(`${base}/v1/auth/signup`, object);
          const data = response.data;
          if (!data?.ok) {
            toast.success("email have been sent");
          }
          if (data.status === 501) {
            set({
              error: "Something went wrong with signup",
              isLoading: false,
            });
          } else {
            set({ user: data.data, isLoading: false, error: null });
          }

          return response;
        } catch (error) {
          const errMsg =
            error?.response?.message ||
            error.message ||
            "Error Signing Up user ";
          console.error("Signup error:", errMsg);
          toast.error(
            error?.response?.data.message ||
              error.message ||
              "Error Signing Up user "
          );
          set({ error: errMsg, isLoading: false });
          throw error;
        }
      },

      // LOGIN
      login: async (object) => {
        set({ isLoading: true, error: null });
        try {
          const response = await app.post(`${base}/v1/auth/login`, object);
          const data = response.data;
          console.log(data);

          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return response;
        } catch (error) {
          console.error(
            "Login error:",
            error?.response?.data?.message || "Error logging in"
          );
          toast.error(error?.response?.data?.message || "Error logging in");
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: async (user) => {
        set({ user: user, isAuthenticated: true, isLoading: false });
        toast.success("profile uploaded");
      },
      // VERIFY EMAIL
      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await app.post(
            `${base}/v1/verification/verify_email`,
            {
              code,
            }
          );

          set({
            isAuthenticated: true,
            error: null,
            isLoading: false,
            isCheckingAuth: false,
          });

          return response.data;
        } catch (error) {
          const errMsg =
            error?.response?.data?.message ||
            "An error occurred during verification";
          console.error("Verify email error:", errMsg);
          set({ error: errMsg, isLoading: false });
          throw error;
        }
      },

      // LOGOUT
      logout: async () => {
        set({ isCheckingAuth: true });
        try {
          await set({
            user: null,
            isAuthenticated: false,
            error: null,
            isCheckingAuth: false,
          });
          await app.post(`${base}/v1/auth/logout`);
        } catch (error) {
          console.warn(error);
          set({ error: null, isCheckingAuth: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
