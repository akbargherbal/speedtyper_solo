try {
  const data = JSON.parse('{"name": "John"}');
  console.log(data.name);
} catch (error) {
  console.error('Parsing error:', error.message);
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}

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

try {
  undefinedFunction();
} catch (error) {
  console.error('Caught error:', error.message);
  console.error('Stack trace:', error.stack);
}