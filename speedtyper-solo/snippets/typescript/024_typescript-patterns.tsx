interface UserProps {
  name: string;
  age: number;
}
const UserComponent: React.FC<UserProps> = ({ name, age }) => {
  return <div>{name} is {age} years old.</div>;
};

import { useState } from 'react';
const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

import { useState, useEffect } from 'react';
interface User {
  id: number;
  name: string;
}
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(setUser);
  }, []);
  return <div>{user ? user.name : 'Loading...'}</div>;
};