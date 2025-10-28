interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

// `Pick` lets you create a new type from an existing one by picking properties.
type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};

// `Partial` makes all properties of a type optional.
function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>): Todo {
  return { ...todo, ...fieldsToUpdate };
}