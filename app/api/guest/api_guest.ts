import { createApiFunction } from '@/lib/create-api-client';

export default function ApiGuest() {
  return {
    postCreateQualification: createApiFunction('POST', 'guest/create-qualification'),
    getListQualification: createApiFunction('GET', 'guest/list-qualification'),
    getListStudent: createApiFunction('GET', 'guest/list-student'),
    getListResume: createApiFunction('GET', 'guest/list-resume'),
    postCreateGuest: createApiFunction('POST', 'guest/create'),
    getListGuest: createApiFunction('GET', 'guest/list'),
    putToggleActiveGuest: createApiFunction('PUT', 'guest/edit-status'),
    putUpdateGuestName: createApiFunction('PUT', 'guest/update-name'),
    putUpdateGuestPassword: createApiFunction('PUT', 'guest/update-password'),
    putDeleteGuest: createApiFunction('PUT', 'guest/delete'),
  };
}
