// PATTERN: Async Patterns

const loadData = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Data received'), 1000);
});
loadData.then(result => console.log(result));

// PATTERN: Async Patterns

fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => response.json())
  .then(data => console.log(data.title))
  .then(() => console.log('Processing complete'));

// PATTERN: Async Patterns

fetch('https://invalid-url.example')
  .then(response => response.json())
  .catch(error => console.error('Request failed:', error));

// PATTERN: Async Patterns

fetch('https://jsonplaceholder.typicode.com/users/1')
  .then(response => response.json())
  .catch(error => console.error(error))
  .finally(() => console.log('Cleanup: Request finished'));

// PATTERN: Async Patterns

async function getUser() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  const user = await response.json();
  console.log(user.name);
}
getUser();

// PATTERN: Async Patterns

async function fetchUser() {
  try {
    const response = await fetch('https://invalid-url.example');
    const user = await response.json();
    console.log(user);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}
fetchUser();

// PATTERN: Async Patterns

const urls = [
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/comments/1'
];
Promise.all(urls.map(url => fetch(url).then(res => res.json())))
  .then(results => console.log(results));

// PATTERN: Async Patterns

const fastPromise = new Promise(resolve => setTimeout(() => resolve('Fast done'), 500));
const slowPromise = new Promise(resolve => setTimeout(() => resolve('Slow done'), 1000));
Promise.race([fastPromise, slowPromise]).then(result => console.log(result));

// PATTERN: Async Patterns

const promises = [
  Promise.resolve('Success'),
  Promise.reject('Failed'),
  Promise.resolve('Another success')
];
Promise.allSettled(promises).then(results => console.log(results));

// PATTERN: Async Patterns

const fetchPost = async function(postId) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  return response.json();
};
fetchPost(1).then(post => console.log(post.title));

// PATTERN: Async Patterns

async function processNumbers(numbers) {
  const results = await Promise.all(numbers.map(async num => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return num * 2;
  }));
  console.log(results);
}
processNumbers([1, 2, 3]);