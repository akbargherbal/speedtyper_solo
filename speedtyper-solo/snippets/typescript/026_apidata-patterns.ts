// PATTERN: API/Data Patterns

type UserResponse = {
  id: number;
  name: string;
  email: string;
};

// PATTERN: API/Data Patterns

type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

// PATTERN: API/Data Patterns

enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// PATTERN: API/Data Patterns

const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} as const;

// PATTERN: API/Data Patterns

type Product = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
};

// PATTERN: API/Data Patterns

import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
});

type User = z.infer<typeof userSchema>;

// PATTERN: API/Data Patterns

import { AxiosResponse } from 'axios';

type UserResponse = AxiosResponse<{
  id: number;
  name: string;
  email: string;
}>;

// PATTERN: API/Data Patterns

type UserData = {
  id: number;
  name: string;
  email: string;
};