import { createApiFunction } from '@/lib/create-api-client';

export default function ApiNilaiPembelajaran() {
  return {
    getAllNilaiPembelajaran: createApiFunction('get', 'nilai-pembelajaran/list'),
    postCreateNilaiPembelajaran: createApiFunction('post', 'nilai-pembelajaran/create'),
    getCertificateList: createApiFunction('get', 'nilai-pembelajaran/list-certificate'),
  };
}
