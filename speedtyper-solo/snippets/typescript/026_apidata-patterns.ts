type UserResponse = {
  id: number;
  name: string;
  email: string;
};

type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

type Product = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
};

import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

type User = z.infer<typeof userSchema>;

import { AxiosResponse } from 'axios';

type UserResponse = AxiosResponse<{
  id: number;
  name: string;
  email: string;
}>;

type UserData = {
  id: number;
  name: string;
  email: string;
};