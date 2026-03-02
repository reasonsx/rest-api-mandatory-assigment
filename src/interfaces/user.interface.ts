export interface User {
  _id?: string;
  email: string;
  username?: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}