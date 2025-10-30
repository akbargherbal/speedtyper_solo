// PATTERN: Type Patterns

type UserProfile = {
  username: string;
  email: string;
  age: number;
};

// PATTERN: Type Patterns

function formatInput(input: string | number): string {
  return input.toString().trim();
}

// PATTERN: Type Patterns

type Admin = {
  permissions: string[];
};

type User = {
  name: string;
};

type AdminUser = Admin & User;

// PATTERN: Type Patterns

type Theme = 'light' | 'dark' | 'auto';
const currentTheme: Theme = 'dark';

// PATTERN: Type Patterns

function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// PATTERN: Type Patterns

class ApiError extends Error {
  statusCode: number;
}

function handleError(error: Error) {
  if (error instanceof ApiError) {
    console.log(`API Error: ${error.statusCode}`);
  }
}

// PATTERN: Type Patterns

interface Cat {
  meow(): void;
}

function isCat(pet: any): pet is Cat {
  return typeof pet.meow === 'function';
}

// PATTERN: Type Patterns

type Success = {
  type: 'success';
  data: string;
};

type Error = {
  type: 'error';
  message: string;
};

type Result = Success | Error;

// PATTERN: Type Patterns

const userInput = document.getElementById('user-input') as HTMLInputElement;
const value = userInput.value;

// PATTERN: Type Patterns

function getElement(): HTMLElement | null {
  return document.getElementById('content');
}

const element = getElement()!;
element.classList.add('loaded');