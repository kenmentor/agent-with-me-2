import { create } from "zustand";
import { persist } from "zustand/middleware";
import Req from "@/app/utility/axios";
import { toast } from "sonner";

const { app, base } = Req;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isCheckingAuth: true,
      _hasHydrated: false,

      // Helper to get user ID
      getUserId: () => {
        const user = get().user;
        if (!user) {
          console.log("❌ getUserId: user is null");
          return null;
        }
        const id = user._id || user._doc?._id || user.id;
        console.log("👤 getUserId:", id);
        return id;
      },

      // Helper to get display name (firstName + lastName or userName)
      getDisplayName: () => {
        const user = get().user;
        if (!user) return "User";
        return user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.userName || "User";
      },

      // Helper to get first name for greetings
      getFirstName: () => {
        const user = get().user;
        if (!user) return "User";
        return user.firstName || user.userName?.split(" ")[0] || "User";
      },

      // Helper to mark hydration complete
      setHasHydrated: (state) => {
        // Normalize user data if it has MongoDB document structure
        if (state.user && state.user._doc) {
          state.user = state.user._doc;
        }
        set({ _hasHydrated: true });
      },

      // SIGNUP
      signup: async (object) => {
        set({ isLoading: true, error: null });
        try {
          const response = await app.post(`${base}/v1/auth/signup`, object);
          const data = response.data;
          if (data?.ok) {
            toast.success("Email has been sent");
          }
          if (data.status === 501) {
            set({
              error: "Something went wrong with signup",
              isLoading: false,
            });
            throw new Error("Something went wrong with signup");
          } else {
            set({ user: data.data, isLoading: false, error: null });
          }
          return response;
        } catch (error) {
          const errMsg =
            error?.response?.message ||
            error.message ||
            "Error Signing Up user ";
          toast.error(
            error?.response?.data?.message ||
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
          console.log("📦 Login response:", data);
          
          // Extract token from data.data.token (backend returns {data: {..., token}})
          const token = data?.data?.token;
          console.log("🔑 Extracted token:", token ? "EXISTS" : "NULL");
          
          if (token) {
            localStorage.setItem("token", token);
            console.log("🔑 Token saved to localStorage");
          } else {
            console.error("❌ No token in response!");
          }
          
          // Extract clean user data
          const userData = data?.data?._doc || data?.data;
          console.log("👤 User data:", userData?._id);
          
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            isCheckingAuth: false,
          });
          return response;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Error logging in");
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      // VERIFY EMAIL
      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await app.post(
            `${base}/v1/verification/verify_email`,
            { code }
          );
          const responseData = response.data?.data;
          let userData = responseData?.user?._doc || responseData?.user || responseData?._doc || responseData;
          
          const token = responseData?.token;
          if (token) {
            localStorage.setItem("token", token);
          }
          
          if (userData) {
            set({
              user: userData,
              isAuthenticated: true,
              error: null,
              isLoading: false,
              isCheckingAuth: false,
            });
            
            // Initialize socket immediately after verification if token exists
            if (token) {
              const { initializeSocket } = await import("@/app/utility/socket");
              initializeSocket(token);
            }
          }
          return response.data;
        } catch (error) {
          const errMsg =
            error?.response?.data?.message ||
            "An error occurred during verification";
          set({ error: errMsg, isLoading: false });
          throw error;
        }
      },

      // LOGOUT
      logout: async () => {
        try {
          // Disconnect socket
          const { disconnectSocket } = await import("@/app/utility/socket");
          disconnectSocket();
          
          // Clear all localStorage
          localStorage.clear();
          
          // Clear state
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
            isCheckingAuth: false,
          });
          
          // Call backend logout
          await app.post(`${base}/v1/auth/logout`);
          
          // Redirect to login
          window.location.href = "/auth/login";
        } catch (error) {
          console.error("Logout error:", error);
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
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      },
    }
  )
);

