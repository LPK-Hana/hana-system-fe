import { createApiFunction } from '@/lib/create-api-client';

export default function ApiJob() {
  return {
    PostCreateJob: createApiFunction('POST', 'job/create'),
    GetDataJob: createApiFunction('GET', 'job/list'),
    GetAssignUserData: createApiFunction('GET', 'job/list-assign-user'),
    PostAssignUser: createApiFunction('POST', 'job/assign'),
    PutDeleteAssignedUser: createApiFunction('PUT', 'job/delete-assign'),
    PutUpdateJob: createApiFunction('PUT', 'job/update'),
    GetLastEdit: createApiFunction('GET', 'job/last-edit'),
    PutDeleteJob: createApiFunction('PUT', 'job/delete'),
  };
}
