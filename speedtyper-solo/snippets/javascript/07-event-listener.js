// This code is intended for a browser environment.
// Create a button to make the example runnable.
document.body.innerHTML = '<button id="myButton">Click Me</button>';

const button = document.getElementById('myButton');

button.addEventListener('click', () => {
  alert('Button was clicked!');
});