import { QueryClient } from '@tanstack/react-query'

/**
 * Un solo QueryClient a nivel de modulo (SPA). No crear dentro de App.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
