import { createApiFunction } from '@/lib/create-api-client';

export default function ApiKelas() {
  return {
    getListKelas: createApiFunction('get', 'kelas/list'),
    postCreateKelas: createApiFunction('post', 'kelas/create'),
    putUpdateKelas: createApiFunction('put', 'kelas/update'),
    putDeleteKelas: createApiFunction('put', 'kelas/delete'),
    putActivateKelas: createApiFunction('put', 'kelas/activate'),
    putHardDeleteKelas: createApiFunction('put', 'kelas/hard-delete'),
  };
}
