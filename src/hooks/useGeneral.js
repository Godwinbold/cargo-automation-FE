import { useQuery, useMutation } from "@tanstack/react-query";
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

export const useCreateAirline = () => {
  return useMutation({
    mutationFn: generalApi.createAirline,
  });
};

export const useUpdateAirline = () => {
  return useMutation({
    mutationFn: ({ id, data }) => generalApi.updateAirline(id, data),
  });
};

export const useDeleteAirline = () => {
  return useMutation({
    mutationFn: generalApi.deleteAirline,
  });
};

export const useGeneral = () => {
  return {
    useGetAllAirlines,
    useGetAirlineById,
    useCreateAirline,
    useUpdateAirline,
    useDeleteAirline,
  };
};

export default useGeneral;
