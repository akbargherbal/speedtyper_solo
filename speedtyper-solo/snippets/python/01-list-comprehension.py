# Create a list of squares from 0 to 9
squares = [x**2 for x in range(10)]
print(squares)

# Create a list of even numbers from a source list
numbers = [1, 2, 3, 4, 5, 6]
evens = [n for n in numbers if n % 2 == 0]
print(evens)