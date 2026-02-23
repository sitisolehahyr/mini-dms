import api from "./client";
import { ApiSuccess } from "../types/api";
import { AuthPayload, User } from "../types/auth";

export const login = async (email: string, password: string): Promise<AuthPayload> => {
  const { data } = await api.post<ApiSuccess<AuthPayload>>("/auth/login", { email, password });
  return data.data;
};

export const register = async (email: string, fullName: string, password: string): Promise<AuthPayload> => {
  const { data } = await api.post<ApiSuccess<AuthPayload>>("/auth/register", {
    email,
    full_name: fullName,
    password,
  });
  return data.data;
};

export const fetchMe = async (): Promise<User> => {
  const { data } = await api.get<ApiSuccess<User>>("/auth/me");
  return data.data;
};
