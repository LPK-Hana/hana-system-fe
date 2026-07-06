import { createApiFunction } from '@/lib/create-api-client';

export default function ApiInputKk() {
  const getByUser = (userName: string, path: string) =>
    createApiFunction('GET', `${path}?user_name=${encodeURIComponent(userName)}`)();

  return {
    PostCreateKKID: createApiFunction('POST', 'input-kk/create-kk-id'),
    PostCreateKKJP: createApiFunction('POST', 'input-kk/create-kk-jp'),
    GetDataKKID: createApiFunction('GET', 'input-kk/get-kk-id'),
    GetDataKKJP: createApiFunction('GET', 'input-kk/get-kk-jp'),
    GetCheckKK: (userName: string) => getByUser(userName, 'input-kk/check-kk'),
    GetAdminDataKKID: (userName: string) => getByUser(userName, 'input-kk/get-kk-id'),
    GetAdminDataKKJP: (userName: string) => getByUser(userName, 'input-kk/get-kk-jp'),
    PutUpdateKKID: createApiFunction('PUT', 'input-kk/update-kk-id'),
    PutUpdateKKJP: createApiFunction('PUT', 'input-kk/update-kk-jp'),
  };
}
