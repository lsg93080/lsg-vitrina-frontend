// URLs for cross-service navigation (all go through nginx in production)
export const externalRoutes = {
  cloud: import.meta.env.VITE_CLOUD_MODULE_URL || '/cloud/',
  home: import.meta.env.VITE_HOME_URL || '/home/'
} as const
