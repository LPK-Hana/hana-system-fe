"use client";

import axios, { type AxiosError } from "axios";
import { forceRelogin, getAuthToken } from "@/lib/auth";

const axiosAuth = axios.create();

let reloginInProgress = false;

axiosAuth.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

axiosAuth.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    const url = String(err.config?.url ?? "");
    const isLoginRequest =
      url.includes("auth/login") || url.endsWith("/auth/login");
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !isLoginRequest &&
      !reloginInProgress
    ) {
      reloginInProgress = true;
      forceRelogin("unauthorized");
    }
    return Promise.reject(err);
  },
);

export default axiosAuth;
