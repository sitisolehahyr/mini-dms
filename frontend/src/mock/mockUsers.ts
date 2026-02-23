import { User } from "../types/dms";

export const adminUser: User = {
  id: 1,
  name: "Alex Morgan",
  email: "admin@example.com",
  role: "ADMIN",
};

export const userA: User = {
  id: 2,
  name: "Priya Patel",
  email: "priya.patel@example.com",
  role: "USER",
};

export const userB: User = {
  id: 3,
  name: "Ethan Carter",
  email: "ethan.carter@example.com",
  role: "USER",
};

export const mockUsers: User[] = [adminUser, userA, userB];
