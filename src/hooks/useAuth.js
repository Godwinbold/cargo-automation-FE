import { useMutation, useQuery } from "@tanstack/react-query";
import authApi from "../api/auth";

export const useRegisterAirlineUser = () => {
  return useMutation({
    mutationFn: ({ airlineId, userData }) =>
      authApi.registerAirlineUser(airlineId, userData),
  });
};

export const useLoginAirlineUser = () => {
  return useMutation({
    mutationFn: ({ airlineId, credentials }) =>
      authApi.loginAirlineUser(airlineId, credentials),
  });
};

export const useRegisterAdmin = () => {
  return useMutation({
    mutationFn: authApi.registerAdmin,
  });
};

export const useRegisterExecutive = () => {
  return useMutation({
    mutationFn: authApi.registerExecutive,
  });
};

export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
    ...options,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useConfirmEmail = () => {
  return useMutation({
    mutationFn: ({ email, token }) => authApi.confirmEmail(email, token),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useAuth = () => {
  return {
    useRegisterAirlineUser,
    useLoginAirlineUser,
    useRegisterAdmin,
    useRegisterExecutive,
    useCurrentUser,
    useResetPassword,
    useForgotPassword,
    useConfirmEmail,
    useChangePassword,
  };
};

export default useAuth;
