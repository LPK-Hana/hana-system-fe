import { createApiFunction } from '@/lib/create-api-client';

export default function ApiUser() {
  return {
    getAllUser: createApiFunction('get', 'user/list'),
    getAllActiveUser: createApiFunction('get', 'user/list-active'),
    getAllInactiveUser: createApiFunction('get', 'user/list-inactive'),
    getUnverifUser: createApiFunction('get', 'user/list-unverif-user'),
    postCreateUser: createApiFunction('post', 'user/create'),
    postCreateUserBatch: createApiFunction('post', 'user/create-batch'),
    putUpdateUserPassword: createApiFunction('put', 'user/update-pass'),
    putUpdateUserSelfPassword: createApiFunction('put', 'user/update-pass-self'),
    putUpdateUserName: createApiFunction('put', 'user/update-name'),
    putUpdateUserClass: createApiFunction('put', 'user/update-class'),
    putDeleteUser: createApiFunction('put', 'user/delete'),
    putAssignKelas: createApiFunction('put', 'user/assign-kelas'),
    putBulkAssignKelas: createApiFunction('put', 'user/bulk-assign-kelas'),
    putKickKelas: createApiFunction('put', 'user/kick-kelas'),
    putChangeKelas: createApiFunction('put', 'user/change-kelas'),
    putHardDeleteUser: createApiFunction('put', 'user/hard-delete'),
  };
}
