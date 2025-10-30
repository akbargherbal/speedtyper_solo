// PATTERN: Zustand (State Management)

import { create } from 'zustand'

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))

// PATTERN: Zustand (State Management)

import { useCounterStore } from './store'

function CounterDisplay() {
  const count = useCounterStore((state) => state.count)
  return <div>Current count: {count}</div>
}

// PATTERN: Zustand (State Management)

const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (text) => set((state) => ({ todos: [...state.todos, text] })),
}))

// PATTERN: Zustand (State Management)

const useCartStore = create((set, get) => ({
  items: [],
  getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price, 0),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}))

// PATTERN: Zustand (State Management)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
)