import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  useGetCurrentUser, 
  useLogin, 
  useRegister, 
  useLogout,
  setAuthTokenGetter,
  type LoginRequest,
  type RegisterRequest
} from "@workspace/api-client-react";

// Initialize token getter for all API calls
setAuthTokenGetter(() => localStorage.getItem("spark_token"));

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("spark_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Only fetch user if we have a token
  const { data: user, isLoading: isUserLoading, error } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("spark_token", data.token);
        setTokenState(data.token);
        queryClient.setQueryData([`/api/auth/me`], data.user);
        setLocation("/discover");
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("spark_token", data.token);
        setTokenState(data.token);
        queryClient.setQueryData([`/api/auth/me`], data.user);
        setLocation("/profile"); // New users should complete profile
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSettled: () => {
        localStorage.removeItem("spark_token");
        setTokenState(null);
        queryClient.clear();
        setLocation("/auth");
      }
    }
  });

  // Handle unauthorized errors globally
  useEffect(() => {
    if (error && (error as any).status === 401) {
      localStorage.removeItem("spark_token");
      setTokenState(null);
      setLocation("/auth");
    }
  }, [error, setLocation]);

  return {
    user,
    isAuthenticated: !!user && !!token,
    isLoading: isUserLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
  };
}
