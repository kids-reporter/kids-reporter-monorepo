import { useQuery } from '@tanstack/react-query'

import { getSubcategories } from '@/api/subcategory'

export const SUBCATEGORIES_QUERY_KEY = 'subcategories'

export function useSubcategoriesQuery() {
  return useQuery({
    queryKey: useSubcategoriesQuery.getQueryKey(),
    queryFn: () => getSubcategories(),
    staleTime: Infinity,
  })
}

useSubcategoriesQuery.getQueryKey = () => [SUBCATEGORIES_QUERY_KEY]
