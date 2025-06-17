import { ref, computed } from "vue";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const user = ref(null);
const loading = ref(true);

// Initialize user from Firebase Auth
auth.onAuthStateChanged((firebaseUser) => {
  if (firebaseUser) {
    user.value = {
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
    };
  } else {
    user.value = null;
  }
  loading.value = false;
});

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      }
      throw new Error(errorMessage);
    }
  };

  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
     
      await userCredential.user.updateProfile({
        displayName: name,
      });
      return userCredential.user;
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Signup failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
  };
}
