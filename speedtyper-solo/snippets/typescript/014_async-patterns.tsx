import React, { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      setUser(userData);
    }
    fetchUser();
  }, [userId]);

  return <div>{user ? user.name : 'Loading...'}</div>;
}

import React, { useState } from 'react';

function SubmitButton() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/submit', { method: 'POST' });
      alert('Submitted successfully!');
    } catch (error) {
      alert('Error submitting!');
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>;
}

import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}