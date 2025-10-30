// PATTERN: Error Handling

try {
  const data = JSON.parse('{"name": "John"}');
  console.log(data.name);
} catch (error) {
  console.error('Parsing error:', error.message);
}

// PATTERN: Error Handling

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}

// PATTERN: Error Handling

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function validateEmail(email) {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format');
  }
}

// PATTERN: Error Handling

try {
  undefinedFunction();
} catch (error) {
  console.error('Caught error:', error.message);
  console.error('Stack trace:', error.stack);
}