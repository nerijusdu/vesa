import dayjs from 'dayjs';
import { LoginData, LoginRequest } from '../types';
import { apiUrl } from './api';


export const login = async (data: LoginRequest): Promise<LoginData> => {
  const form = new FormData();
  form.append('username', data.user);
  form.append('password', data.passwd);
  form.append('grant_type', 'password');

  const response = await fetch(`${apiUrl}/api/token`, {
    method: 'POST',
    body: form,
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(response.statusText);
  }
};

export const refreshToken = async (refreshToken: string): Promise<LoginData> => {
  const form = new FormData();
  form.append('refresh_token', refreshToken);
  form.append('grant_type', 'refresh_token');

  const response = await fetch(`${apiUrl}/api/token`, {
    method: 'POST',
    body: form,
  });

  if (response.ok) {
    return response.json();
  } else {
    window.location.href = '/login';
    throw new Error(response.statusText);
  }
};

export const authHeaders = async (): Promise<{ Authorization?: string }> => {
  const data: LoginData = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!data.access_token) {
    return {};
  }

  if (dayjs(data.expires_at).isBefore(dayjs()) && data.refresh_token) {
    // const newData = await refreshToken(data.refresh_token);

    // localStorage.setItem('auth', JSON.stringify({
    //   ...newData,
    //   expires_at: dayjs().add(newData.expires_in, 'second').toISOString(),
    // }));

    // data = newData;
  }

  return { Authorization: `Bearer ${data.access_token}` };
};
