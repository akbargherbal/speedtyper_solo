import React from 'react';

const UserList = ({ users }) => {
  const activeUserElements = users
    .filter(user => user.isActive)
    .map(user => <li key={user.id}>{user.name}</li>);
  return <ul>{activeUserElements}</ul>;
};

import React from 'react';

const ProductGroups = ({ products }) => {
  const groups = products.reduce((acc, product) => {
    (acc[product.category] = acc[product.category] || []).push(product);
    return acc;
  }, {});
  return Object.entries(groups).map(([category, prods]) => (
    <div key={category}>
      <h3>{category}</h3>
      {prods.map(prod => <p key={prod.id}>{prod.name}</p>)}
    </div>
  ));
};

import React from 'react';

const SortedList = ({ items }) => {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <ul>
      {sorted.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
};

import React from 'react';

const UniqueCategories = ({ items }) => {
  const categories = [...new Set(items.map(item => item.category))];
  return (
    <ul>
      {categories.map(cat => <li key={cat}>{cat}</li>)}
    </ul>
  );
};

import React from 'react';

const UserCard = ({ name, email, age }) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      <p>Age: {age}</p>
    </div>
  );
};

import React, { useState } from 'react';

const UserProfile = () => {
  const [profile, setProfile] = useState({ name: 'John', age: 30 });
  const updateAge = () => {
    setProfile(prev => ({ ...prev, age: prev.age + 1 }));
  };
  return (
    <div>
      <p>Name: {profile.name}</p>
      <p>Age: {profile.age}</p>
      <button onClick={updateAge}>Increase Age</button>
    </div>
  );
};