import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store JWT
        localStorage.setItem("token", data.token);

        return {
          success: true,
        };
      }

      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid credentials",
        },
      };
    } catch {
      return {
        success: false,
        error: {
          name: "NetworkError",
          message: "Unable to reach server",
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem("token");
    return { success: true };
  },

  check: async () => {
    const token = localStorage.getItem("token");
    return token
      ? { authenticated: true }
      : { authenticated: false, redirectTo: "/login" };
  },

  getIdentity: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return {
      name: "User",
    };
  },

  getPermissions: async () => null,
   onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    return {};
  },
};
