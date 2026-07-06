import { createApiFunction } from '@/lib/create-api-client';

export default function ApiResume() {
  return {
    getAllCvData: createApiFunction('get', 'resume/list'),
    getMyResume: createApiFunction('get', 'resume/list-user'),
    postCreateCvData: createApiFunction('post', 'resume/create'),
    postEditCvData: createApiFunction('post', 'resume/edit'),
  };
}
