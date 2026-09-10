import { createApiFunction } from '@/lib/create-api-client';

export default function ApiSuperAdmin() {
  return {
    postCreateAdmin: createApiFunction('POST', 'superAdmin/create'),
    getListAdmin: createApiFunction('GET', 'superAdmin/list'),
    putToggleActiveAdmin: createApiFunction('PUT', 'superAdmin/edit-status'),
    putUpdateAdminName: createApiFunction('PUT', 'superAdmin/update-name'),
    putUpdateAdminPassword: createApiFunction('PUT', 'superAdmin/update-password'),
    putDeleteAdmin: createApiFunction('PUT', 'superAdmin/delete'),
  };
}
