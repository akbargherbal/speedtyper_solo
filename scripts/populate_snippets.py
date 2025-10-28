# populate_snippets.py

import argparse
import textwrap
from pathlib import Path
from typing import Dict, List, TypedDict

class Snippet(TypedDict):
    """A type definition for a code snippet."""
    filename: str
    content: str

# A collection of common code patterns for different languages.
SNIPPETS: Dict[str, List[Snippet]] = {
    "python": [
        {
            "filename": "01-list-comprehension.py",
            "content": """
                # Create a list of squares from 0 to 9
                squares = [x**2 for x in range(10)]
                print(squares)

                # Create a list of even numbers from a source list
                numbers = [1, 2, 3, 4, 5, 6]
                evens = [n for n in numbers if n % 2 == 0]
                print(evens)
            """,
        },
        {
            "filename": "02-dictionary-manipulation.py",
            "content": """
                # A dictionary of user information
                user = {"name": "Alice", "age": 30}

                # Accessing a value
                print(user["name"])

                # Adding a new key-value pair
                user["city"] = "New York"

                # Using .get() for safe access
                email = user.get("email", "no-email@example.com")
                print(email)

                # Iterating over keys and values
                for key, value in user.items():
                    print(f"{key}: {value}")
            """,
        },
        {
            "filename": "03-class-definition.py",
            "content": """
                class Dog:
                    \"\"\"A simple class representing a dog.\"\"\"
                    def __init__(self, name: str, breed: str):
                        self.name = name
                        self.breed = breed

                    def bark(self) -> str:
                        return f"{self.name} says woof!"

                my_dog = Dog(name="Buddy", breed="Golden Retriever")
                print(my_dog.bark())
            """,
        },
        {
            "filename": "04-function-with-type-hints.py",
            "content": """
                def calculate_total(price: float, quantity: int, tax_rate: float = 0.05) -> float:
                    \"\"\"Calculate the total cost including tax.\"\"\"
                    subtotal = price * quantity
                    total = subtotal * (1 + tax_rate)
                    return total

                invoice_total = calculate_total(price=19.99, quantity=2)
                print(f"Total: ${invoice_total:.2f}")
            """,
        },
        {
            "filename": "05-decorator.py",
            "content": """
                import time
                from functools import wraps

                def timing_decorator(func):
                    @wraps(func)
                    def wrapper(*args, **kwargs):
                        start_time = time.perf_counter()
                        result = func(*args, **kwargs)
                        end_time = time.perf_counter()
                        print(f"'{func.__name__}' took {end_time - start_time:.4f} seconds.")
                        return result
                    return wrapper

                @timing_decorator
                def slow_function():
                    time.sleep(1)
                    print("Function complete.")

                slow_function()
            """,
        },
        {
            "filename": "06-context-manager.py",
            "content": """
                # The 'with' statement ensures resources are managed correctly.
                try:
                    with open("example.txt", "w") as f:
                        f.write("Hello, file!")
                    # File is automatically closed here, even if errors occur.

                    with open("example.txt", "r") as f:
                        content = f.read()
                        print(content)
                except IOError as e:
                    print(f"An error occurred: {e}")
            """,
        },
        {
            "filename": "07-async-await.py",
            "content": """
                import asyncio

                async def fetch_data(source: str) -> str:
                    print(f"Start fetching from {source}...")
                    await asyncio.sleep(1)  # Simulate network request
                    print(f"Finished fetching from {source}.")
                    return f"Data from {source}"

                async def main():
                    # Run multiple async tasks concurrently
                    results = await asyncio.gather(
                        fetch_data("API 1"),
                        fetch_data("API 2")
                    )
                    print(results)

                if __name__ == "__main__":
                    asyncio.run(main())
            """,
        },
        {
            "filename": "08-exception-handling.py",
            "content": """
                def divide(a, b):
                    try:
                        result = a / b
                    except ZeroDivisionError:
                        print("Error: Cannot divide by zero.")
                        return None
                    except TypeError as e:
                        print(f"Error: Invalid input type - {e}")
                        return None
                    else:
                        print("Division successful.")
                        return result
                    finally:
                        print("Execution finished.")

                divide(10, 2)
                divide(10, 0)
                divide("10", 2)
            """,
        },
        {
            "filename": "09-requests-api-call.py",
            "content": """
                import requests

                def get_user_data(user_id: int):
                    api_url = f"https://jsonplaceholder.typicode.com/users/{user_id}"
                    try:
                        response = requests.get(api_url)
                        response.raise_for_status()  # Raise an exception for bad status codes
                        return response.json()
                    except requests.exceptions.RequestException as e:
                        print(f"An error occurred: {e}")
                        return None

                user = get_user_data(1)
                if user:
                    print(f"User Name: {user.get('name')}")
                    print(f"Email: {user.get('email')}")
            """,
        },
        {
            "filename": "10-generator-function.py",
            "content": """
                def fibonacci_sequence(limit: int):
                    \"\"\"Generate Fibonacci numbers up to a given limit.\"\"\"
                    a, b = 0, 1
                    while a < limit:
                        yield a
                        a, b = b, a + b

                # Generators are memory-efficient for large sequences
                for number in fibonacci_sequence(100):
                    print(number)
            """,
        },
    ],
    "javascript": [
        {
            "filename": "01-async-fetch.js",
            "content": """
                async function fetchUserData(userId) {
                  const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
                  try {
                    const response = await fetch(url);
                    if (!response.ok) {
                      throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const userData = await response.json();
                    console.log(userData.name);
                  } catch (error) {
                    console.error("Could not fetch user data:", error);
                  }
                }

                fetchUserData(1);
            """,
        },
        {
            "filename": "02-array-map-filter.js",
            "content": """
                const numbers = [1, 2, 3, 4, 5, 6];

                // .map() creates a new array by transforming every element.
                const doubled = numbers.map(num => num * 2);
                console.log(doubled); // [2, 4, 6, 8, 10, 12]

                // .filter() creates a new array with elements that pass a test.
                const evens = numbers.filter(num => num % 2 === 0);
                console.log(evens); // [2, 4, 6]
            """,
        },
        {
            "filename": "03-array-reduce.js",
            "content": """
                const numbers = [10, 20, 30, 40];

                // .reduce() executes a reducer function to produce a single value.
                const sum = numbers.reduce((accumulator, currentValue) => {
                  return accumulator + currentValue;
                }, 0); // 0 is the initial value

                console.log(`The sum is: ${sum}`); // The sum is: 100
            """,
        },
        {
            "filename": "04-object-destructuring.js",
            "content": """
                const user = {
                  id: 123,
                  name: "John Doe",
                  email: "john.doe@example.com",
                  address: {
                    city: "Anytown",
                    country: "USA"
                  }
                };

                // Extract properties into variables
                const { name, email } = user;
                console.log(`User: ${name}, Email: ${email}`);

                // Extract nested properties
                const { address: { city } } = user;
                console.log(`City: ${city}`);
            """,
        },
        {
            "filename": "05-spread-operator.js",
            "content": """
                // For arrays
                const arr1 = ['a', 'b'];
                const arr2 = [...arr1, 'c', 'd'];
                console.log(arr2); // ['a', 'b', 'c', 'd']

                // For objects
                const obj1 = { name: "Alice", age: 30 };
                const obj2 = { ...obj1, city: "New York" };
                console.log(obj2); // { name: 'Alice', age: 30, city: 'New York' }
            """,
        },
        {
            "filename": "06-promise-handling.js",
            "content": """
                function delay(ms) {
                  return new Promise(resolve => setTimeout(resolve, ms));
                }

                console.log("Starting...");

                delay(1000)
                  .then(() => {
                    console.log("One second has passed.");
                    return delay(1000);
                  })
                  .then(() => {
                    console.log("Two seconds have passed.");
                  })
                  .catch(error => {
                    console.error("An error occurred:", error);
                  });
            """,
        },
        {
            "filename": "07-event-listener.js",
            "content": """
                // This code is intended for a browser environment.
                // Create a button to make the example runnable.
                document.body.innerHTML = '<button id="myButton">Click Me</button>';

                const button = document.getElementById('myButton');

                button.addEventListener('click', () => {
                  alert('Button was clicked!');
                });
            """,
        },
        {
            "filename": "08-local-storage.js",
            "content": """
                // This code is intended for a browser environment.

                // Save data to localStorage
                localStorage.setItem('username', 'Alice');
                console.log("Saved username to localStorage.");

                // Get data from localStorage
                const username = localStorage.getItem('username');
                console.log(`Retrieved username: ${username}`);

                // Remove data from localStorage
                localStorage.removeItem('username');
                console.log("Removed username from localStorage.");
            """,
        },
        {
            "filename": "09-es-module.js",
            "content": """
                // --- lib.js ---
                // To use this, you would need two files.
                // This example shows the content for both.

                /*
                export const PI = 3.14159;

                export function greet(name) {
                  return `Hello, ${name}!`;
                }
                */

                // --- main.js ---
                /*
                import { PI, greet } from './lib.js';

                console.log(greet('World'));
                console.log(`The value of PI is approx ${PI}.`);
                */
                console.log("This file demonstrates ES Module syntax.");
            """,
        },
        {
            "filename": "10-ternary-operator.js",
            "content": """
                const userIsLoggedIn = true;
                const age = 25;

                const welcomeMessage = userIsLoggedIn ? "Welcome back!" : "Please log in.";
                console.log(welcomeMessage);

                const userStatus = age >= 18 ? "Adult" : "Minor";
                console.log(`User status: ${userStatus}`);
            """,
        },
    ],
    "typescript": [
        {
            "filename": "01-interface-definition.ts",
            "content": """
                interface User {
                  id: number;
                  name: string;
                  email?: string; // Optional property
                }

                function printUser(user: User): void {
                  console.log(`User ${user.name} (ID: ${user.id})`);
                }

                const myUser: User = { id: 1, name: "Alice" };
                printUser(myUser);
            """,
        },
        {
            "filename": "02-typed-function.ts",
            "content": """
                function add(a: number, b: number): number {
                  return a + b;
                }

                const sum: number = add(5, 10);
                console.log(`The sum is: ${sum}`);

                // This would cause a TypeScript error:
                // add("5", "10");
            """,
        },
        {
            "filename": "03-generic-function.ts",
            "content": """
                function identity<T>(arg: T): T {
                  return arg;
                }

                // The type is inferred from the argument
                let outputString = identity("hello");
                let outputNumber = identity(123);

                console.log(typeof outputString); // string
                console.log(typeof outputNumber); // number
            """,
        },
        {
            "filename": "04-react-hook-useState.tsx",
            "content": """
                import React, { useState } from 'react';

                interface CounterProps {
                  initialValue?: number;
                }

                const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
                  const [count, setCount] = useState<number>(initialValue);

                  return (
                    <div>
                      <p>Count: {count}</p>
                      <button onClick={() => setCount(count + 1)}>Increment</button>
                    </div>
                  );
                };

                export default Counter;
            """,
        },
        {
            "filename": "05-class-with-types.ts",
            "content": """
                class Car {
                  private readonly make: string;
                  private model: string;
                  public year: number;

                  constructor(make: string, model: string, year: number) {
                    this.make = make;
                    this.model = model;
                    this.year = year;
                  }

                  public getDescription(): string {
                    return `${this.year} ${this.make} ${this.model}`;
                  }
                }

                const myCar = new Car("Toyota", "Corolla", 2021);
                console.log(myCar.getDescription());
            """,
        },
        {
            "filename": "06-enum.ts",
            "content": """
                enum ResponseStatus {
                  Success = 200,
                  NotFound = 404,
                  Error = 500,
                }

                function handleResponse(status: ResponseStatus): void {
                  switch (status) {
                    case ResponseStatus.Success:
                      console.log("Request was successful.");
                      break;
                    case ResponseStatus.NotFound:
                      console.log("Resource not found.");
                      break;
                    case ResponseStatus.Error:
                      console.log("An internal server error occurred.");
                      break;
                  }
                }

                handleResponse(ResponseStatus.Success);
            """,
        },
        {
            "filename": "07-utility-types.ts",
            "content": """
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
            """,
        },
        {
            "filename": "08-async-fetch-with-types.ts",
            "content": """
                interface Post {
                  userId: number;
                  id: number;
                  title: string;
                  body: string;
                }

                async function fetchPosts(): Promise<Post[]> {
                  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
                  if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                  }
                  return response.json() as Promise<Post[]>;
                }

                fetchPosts().then(posts => {
                  console.log(`Fetched ${posts.length} posts.`);
                  console.log(`Title of first post: ${posts[0].title}`);
                });
            """,
        },
        {
            "filename": "09-type-guard.ts",
            "content": """
                function isString(value: unknown): value is string {
                  return typeof value === 'string';
                }

                function processInput(input: string | number) {
                  if (isString(input)) {
                    // TypeScript now knows `input` is a string here
                    console.log(input.toUpperCase());
                  } else {
                    // TypeScript knows `input` is a number here
                    console.log(input * 2);
                  }
                }

                processInput("hello");
                processInput(42);
            """,
        },
        {
            "filename": "10-union-and-literal-types.ts",
            "content": """
                type Status = "loading" | "success" | "error";

                let currentStatus: Status;

                currentStatus = "loading";
                console.log(`Status: ${currentStatus}`);

                currentStatus = "success";
                console.log(`Status: ${currentStatus}`);

                // This would cause a TypeScript error:
                // currentStatus = "failed";
            """,
        },
    ],
}

def main():
    """Main function to generate snippet files."""
    parser = argparse.ArgumentParser(
        description="Populate a directory with common code snippets."
    )
    parser.add_argument(
        "output_dir",
        type=Path,
        help="The root directory to generate snippets in (e.g., 'snippets/').",
    )
    args = parser.parse_args()
    root_path: Path = args.output_dir

    print(f"Generating snippets in '{root_path.resolve()}'...")

    for lang, snippets in SNIPPETS.items():
        lang_dir = root_path / lang
        lang_dir.mkdir(parents=True, exist_ok=True)

        for snippet in snippets:
            file_path = lang_dir / snippet["filename"]
            content = textwrap.dedent(snippet["content"]).strip()
            
            file_path.write_text(content, encoding="utf-8")
            print(f"  -> Created {file_path}")

    print("\nSnippet generation complete.")


if __name__ == "__main__":
    main()