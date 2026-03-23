import { useMutation, useQuery } from '@tanstack/react-query';
import shipmentApi from '../api/shipment';

// Hook to get shipments
export const useGetShipments = (airlineId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['shipments', airlineId, params],
    queryFn: () => shipmentApi.getShipments(airlineId, params),
    enabled: !!airlineId,
    ...options,
  });
};

// Hook to create a shipment
export const useCreateShipment = () => {
  return useMutation({
    mutationFn: ({ airlineId, data }) => shipmentApi.createShipment(airlineId, data),
  });
};

// Hook to search shipments by AWB
export const useSearchShipments = (airlineId, awbNumber, options = {}) => {
  return useQuery({
    queryKey: ['shipments', 'search', airlineId, awbNumber],
    queryFn: () => shipmentApi.searchShipments(airlineId, awbNumber),
    enabled: !!airlineId && !!awbNumber,
    ...options,
  });
};

// Hook to get shipment by ID
export const useGetShipmentById = (airlineId, id, options = {}) => {
  return useQuery({
    queryKey: ['shipment', airlineId, id],
    queryFn: () => shipmentApi.getShipmentById(airlineId, id),
    enabled: !!airlineId && !!id,
    ...options,
  });
};

// Hook to add shipment note
export const useAddShipmentNote = () => {
  return useMutation({
    mutationFn: ({ airlineId, id, data }) =>
      shipmentApi.addShipmentNote(airlineId, id, data),
  });
};


// Hook to delete shipment
export const useDeleteShipment = () => {
  return useMutation({
    mutationFn: ({ airlineId, id }) => shipmentApi.deleteShipment(airlineId, id),
  });
};

// Group hook
export const useShipment = () => {
  return {
    useGetShipments,
    useCreateShipment,
    useSearchShipments,
    useGetShipmentById,
    useAddShipmentNote,
    useDeleteShipment,
  };
};

export default useShipment;
