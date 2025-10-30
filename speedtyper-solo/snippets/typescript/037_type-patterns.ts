type UserProfile = {
  username: string;
  email: string;
  age: number;
};

function formatInput(input: string | number): string {
  return input.toString().trim();
}

type Admin = {
  permissions: string[];
};

type User = {
  name: string;
};

type AdminUser = Admin & User;

type Theme = 'light' | 'dark' | 'auto';
const currentTheme: Theme = 'dark';

function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

class ApiError extends Error {
  statusCode: number;
}

function handleError(error: Error) {
  if (error instanceof ApiError) {
    console.log(`API Error: ${error.statusCode}`);
  }
}

interface Cat {
  meow(): void;
}

function isCat(pet: any): pet is Cat {
  return typeof pet.meow === 'function';
}

type Success = {
  type: 'success';
  data: string;
};

type Error = {
  type: 'error';
  message: string;
};

type Result = Success | Error;

const userInput = document.getElementById('user-input') as HTMLInputElement;
const value = userInput.value;

function getElement(): HTMLElement | null {
  return document.getElementById('content');
}

const element = getElement()!;
element.classList.add('loaded');