// PATTERN: React-Specific TypeScript

import React from 'react';

interface GreetingProps {
  name: string;
}

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

// PATTERN: React-Specific TypeScript

interface ButtonProps {
  onClick: () => void;
  label: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, label }) => {
  return <button onClick={onClick}>{label}</button>;
};

// PATTERN: React-Specific TypeScript

interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div>{children}</div>;
};

// PATTERN: React-Specific TypeScript

const Input: React.FC = () => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };

  return <input type="text" onChange={handleChange} />;
};

// PATTERN: React-Specific TypeScript

const Counter: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};

// PATTERN: React-Specific TypeScript

interface User {
  id: number;
  name: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);

  return <div>{user ? user.name : 'No user'}</div>;
};

// PATTERN: React-Specific TypeScript

const InputFocus: React.FC = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
};

// PATTERN: React-Specific TypeScript

const MessageDisplay: React.FC = () => {
  const [name, setName] = React.useState('');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setMessage(`Hello, ${name}`);
  }, [name]);

  return <p>{message}</p>;
};

// PATTERN: React-Specific TypeScript

import { useState } from 'react';

function useToggle(initialState: boolean = false) {
  const [state, setState] = useState(initialState);
  const toggle = () => setState(!state);
  return [state, toggle] as const;
}

// PATTERN: React-Specific TypeScript

import React from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// PATTERN: React-Specific TypeScript

import React from 'react';

interface CustomInputProps {
  label: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} type="text" />
      </div>
    );
  }
);