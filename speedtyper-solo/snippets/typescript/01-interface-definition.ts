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