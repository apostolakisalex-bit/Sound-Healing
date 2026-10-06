import axios, { AxiosInstance } from 'axios';
import { storage } from '@/src/utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL || ''}/api`,
  timeout: 30000,
});

const TOKEN_KEY = 'shg_auth_token';

export async function setAuthToken(token: string | null) {
  if (token) {
    await storage.secureSet(TOKEN_KEY, token);
  } else {
    await storage.secureRemove(TOKEN_KEY);
  }
}

export async function getAuthToken(): Promise<string | null> {
  return await storage.secureGet(TOKEN_KEY, '');
}

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

