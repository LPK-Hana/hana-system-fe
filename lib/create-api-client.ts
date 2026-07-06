'use client';

import axiosAuth from '@/lib/axiosAuthClient';
import { isDemoModeClient } from '@/lib/demo-mode';
import { invokeClientApi } from '@/lib/gada-client-api';

/**
 * Factory API — di mode demo/FE-only semua request diarahkan ke client store (tanpa HTTP).
 */
export function createApiFunction(method: string, url: string) {
  const isGet = method.toUpperCase() === 'GET';

  return async (dataOrParams?: unknown) => {
    if (typeof window !== 'undefined' && isDemoModeClient()) {
      return invokeClientApi(method, url, dataOrParams, isGet);
    }

    const axiosConfig: {
      method: string;
      url: string;
      data?: unknown;
      params?: unknown;
    } = {
      method,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${url}`.replace(/\/+/g, '/').replace(':/', '://'),
    };

    if (isGet) {
      axiosConfig.params = dataOrParams;
    } else {
      axiosConfig.data = dataOrParams;
    }

    try {
      const res = await axiosAuth(axiosConfig);
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      return (
        error?.response?.data || {
          status: 500,
          message: error?.message || 'Terjadi kesalahan saat menghubungi server',
        }
      );
    }
  };
}
