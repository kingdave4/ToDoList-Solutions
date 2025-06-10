import { ref, computed } from "vue";

const user = ref(null);
const token = ref(localStorage.getItem("token") || null);

// Initialize user from localStorage on module load
const savedUser = localStorage.getItem("user");
if (savedUser && token.value) {
  try {
    user.value = JSON.parse(savedUser);
  } catch (e) {
    console.error("Failed to parse saved user data:", e);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const login = (userData, userToken) => {
    user.value = userData;
    token.value = userToken;
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const initAuth = () => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser);
        token.value = savedToken;
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        logout();
      }
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initAuth,
  };
}
