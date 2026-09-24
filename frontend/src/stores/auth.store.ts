import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { disconnectSocket } from "../lib/socket";
import { TOKEN_COOKIE } from "../lib/token";

import type { AuthUser, UserRole } from "../types/api";

// Re-exported so existing imports from this store keep working.
export { TOKEN_COOKIE };

interface AuthState {
  user: AuthUser | null;
  signIn: (user: AuthUser, token: string) => void;
  signOut: () => void;
  isAuthenticated: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      signIn: (user, token) => {
        // Half a day, matching the backend's 1d JWT with room to spare.
        Cookies.set(TOKEN_COOKIE, token, { expires: 0.5, sameSite: "lax" });
        set({ user });
      },

      signOut: () => {
        disconnectSocket();
        Cookies.remove(TOKEN_COOKIE);
        set({ user: null });
      },

      isAuthenticated: () => Boolean(get().user && Cookies.get(TOKEN_COOKIE)),

      hasRole: (...roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    { name: "fixflow-auth", partialize: (state) => ({ user: state.user }) },
  ),
);
