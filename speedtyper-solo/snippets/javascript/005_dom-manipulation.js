// PATTERN: DOM Manipulation

const header = document.querySelector('h1');
header.style.color = 'blue';
header.textContent = 'Updated Header';

// PATTERN: DOM Manipulation

const items = document.querySelectorAll('.item');
items.forEach(item => {
  item.classList.add('selected');
});

// PATTERN: DOM Manipulation

const btn = document.querySelector('#myButton');
btn.addEventListener('click', () => {
  alert('Button was clicked!');
});

// PATTERN: DOM Manipulation

const newElement = document.createElement('p');
newElement.textContent = 'This is a new paragraph.';
document.body.appendChild(newElement);

// PATTERN: DOM Manipulation

const element = document.querySelector('#toggleElement');
element.addEventListener('click', () => {
  element.classList.toggle('active');
});

// PATTERN: DOM Manipulation

const link = document.querySelector('a');
const href = link.getAttribute('href');
link.setAttribute('target', '_blank');

// PATTERN: DOM Manipulation

const demoDiv = document.querySelector('#demo');
demoDiv.textContent = '<b>Bold Text</b>';
console.log(demoDiv.innerHTML);
demoDiv.innerHTML = '<b>Bold Text</b>';
console.log(demoDiv.textContent);

// PATTERN: DOM Manipulation

const userDiv = document.querySelector('#userInfo');
const userId = userDiv.dataset.userId;
userDiv.dataset.role = 'admin';

// PATTERN: DOM Manipulation

const list = document.querySelector('#itemList');
list.addEventListener('click', (event) => {
  if (event.target && event.target.matches('li')) {
    console.log('Item clicked:', event.target.textContent);
  }
});