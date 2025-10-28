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