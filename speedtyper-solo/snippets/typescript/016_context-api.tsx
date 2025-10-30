import React, { createContext, useState } from 'react';
const UserContext = createContext();
function App() {
  const [user, setUser] = useState({ name: 'Alice' });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <UserProfile />
    </UserContext.Provider>
  );
}

import React, { useContext } from 'react';
import { UserContext } from './UserContext';
function UserProfile() {
  const { user } = useContext(UserContext);
  return <div>Hello, {user.name}!</div>;
}