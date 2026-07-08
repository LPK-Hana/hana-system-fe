import { createApiFunction } from '@/lib/create-api-client';

export default function ApiAuth() {
  return {
    postLogin: createApiFunction('post', 'auth/login'),
    postLoginGuest: createApiFunction('post', 'auth/login-guest'),
    postLoginSuperAdmin: createApiFunction('post', 'auth/login-superadmin'),
  };
}
