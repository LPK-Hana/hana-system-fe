import { createApiFunction } from '@/lib/create-api-client';

export default function ApiPeminatan() {
  return {
    get: createApiFunction('GET', 'peminatan/get'),
    save: createApiFunction('POST', 'peminatan/save'),
  };
}
