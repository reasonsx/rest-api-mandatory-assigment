export type UserRole = "user" | "admin";

export interface User {
  _id?: string;
  email: string;
  username?: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}