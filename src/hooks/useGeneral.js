import { useQuery } from "@tanstack/react-query";
import generalApi from "../api/general";

export const useGetAllAirlines = (options = {}) => {
  return useQuery({
    queryKey: ["allAirlines"],
    queryFn: generalApi.getAllAirlines,
    ...options,
  });
};

export const useGetAirlineById = (id, options = {}) => {
  return useQuery({
    queryKey: ["airline", id],
    queryFn: () => generalApi.getAirlineById(id),
    enabled: Boolean(id),
    ...options,
  });
};

export const useGeneral = () => {
  return {
    useGetAllAirlines,
    useGetAirlineById,
  };
};

export default useGeneral;
