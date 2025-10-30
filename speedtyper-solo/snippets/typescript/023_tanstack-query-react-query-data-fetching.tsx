// PATTERN: TanStack Query / React Query (Data Fetching)

const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/api/todos').then(res => res.json())
});

// PATTERN: TanStack Query / React Query (Data Fetching)

const { data } = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetch(`/api/todos/${todoId}`).then(res => res.json())
});

// PATTERN: TanStack Query / React Query (Data Fetching)

const mutation = useMutation({
  mutationFn: (newTodo) => fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify(newTodo)
  }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
});

// PATTERN: TanStack Query / React Query (Data Fetching)

const mutation = useMutation({
  mutationFn: updateTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
});

// PATTERN: TanStack Query / React Query (Data Fetching)

const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
});

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

// PATTERN: TanStack Query / React Query (Data Fetching)

const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId
});

// PATTERN: TanStack Query / React Query (Data Fetching)

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}