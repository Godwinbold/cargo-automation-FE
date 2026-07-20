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

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: adminApi.deleteUser,
  });
};

export const useGetAuditLogs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => adminApi.getAuditLogs(params),
    ...options,
  });
};

export const useAdmin = () => {
  return {
    useInviteUser,
    useGetAppUsers,
    useDeleteUser,
    useGetAuditLogs,
  };
};

export default useAdmin;
