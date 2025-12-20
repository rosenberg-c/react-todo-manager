const getHost = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
};

export const API_CONFIG = {
  get USERS_BASE_URL() {
    return `http://${getHost()}:3001`;
  },
  get TODOS_BASE_URL() {
    return `http://${getHost()}:3002`;
  },
} as const;
