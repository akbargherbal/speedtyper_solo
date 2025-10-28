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