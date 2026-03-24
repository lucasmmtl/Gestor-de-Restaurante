import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '@/services/dashboard-service';

export function useDashboardStats() {
  return useQuery({
    queryFn: () => dashboardService.getStats(),
    queryKey: ['dashboard'],
  });
}
