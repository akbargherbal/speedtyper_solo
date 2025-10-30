const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/api/todos').then(res => res.json())
});

const { data } = useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetch(`/api/todos/${todoId}`).then(res => res.json())
});

const mutation = useMutation({
  mutationFn: (newTodo) => fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify(newTodo)
  }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
});

const mutation = useMutation({
  mutationFn: updateTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }
});

const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos
});

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}