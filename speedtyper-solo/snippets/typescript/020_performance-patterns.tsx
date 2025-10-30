import React, { useMemo, useState } from 'react';

function FilteredList({ items }) {
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(() => {
    return items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{filteredItems.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div>
  );
}

import React, { useCallback, useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount(c => c + 1), []);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

import React from 'react';

const UserProfile = React.memo(function UserProfile({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
});