def fibonacci_sequence(limit: int):
    """Generate Fibonacci numbers up to a given limit."""
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

# Generators are memory-efficient for large sequences
for number in fibonacci_sequence(100):
    print(number)