export type UserRole = "USER" | "ADMIN";

export type User = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type AuthPayload = {
  access_token: string;
  token_type: string;
  user: User;
};
