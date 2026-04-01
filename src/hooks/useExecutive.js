import { useQuery } from "@tanstack/react-query";
import executiveApi from "../api/executive";

export const useGetExecutiveDashboard = (params, options = {}) => {
  return useQuery({
    queryKey: ["executiveDashboard", params],
    queryFn: () => executiveApi.getDashboard(params),
    ...options,
  });
};

export const useExecutive = () => {
  return {
    useGetExecutiveDashboard,
  };
};

export default useExecutive;
