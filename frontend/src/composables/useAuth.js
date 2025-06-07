import { ref, computed } from "vue";

const user = ref(null);
const token = ref(localStorage.getItem("token") || null);

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);

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
      user.value = JSON.parse(savedUser);
      token.value = savedToken;
    }
  };

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    login,
    logout,
    initAuth,
  };
}
