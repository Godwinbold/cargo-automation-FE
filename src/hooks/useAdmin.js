import { useMutation, useQuery } from "@tanstack/react-query";
import adminApi from "../api/admin";

export const useInviteUser = () => {
  return useMutation({
    mutationFn: adminApi.inviteUser,
  });
};

export const useGetAppUsers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["appUsers", params],
    queryFn: () => adminApi.getAppUsers(params),
    ...options,
  });
};

export const useAdmin = () => {
  return {
    useInviteUser,
    useGetAppUsers,
  };
};

export default useAdmin;
