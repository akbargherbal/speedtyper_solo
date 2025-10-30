import axios from 'axios';
const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
});
export default apiClient;

import { useState, useEffect } from 'react';
const useApi = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);
  return { data, error, loading };
};

import { useState } from 'react';
const useToasts = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 3000);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  return { toasts, addToast, removeToast };
};

const LoadingSpinner = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div>Loading...</div>
    </div>
  );
};