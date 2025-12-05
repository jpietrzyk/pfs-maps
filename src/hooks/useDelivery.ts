import { useContext } from 'react';
import { DeliveryContext } from '@/contexts/DeliveryContext';

export const useDelivery = () => {
  const context = useContext(DeliveryContext);

  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }

  return context;
};
