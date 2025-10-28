# A dictionary of user information
user = {"name": "Alice", "age": 30}

# Accessing a value
print(user["name"])

# Adding a new key-value pair
user["city"] = "New York"

# Using .get() for safe access
email = user.get("email", "no-email@example.com")
print(email)

# Iterating over keys and values
for key, value in user.items():
    print(f"{key}: {value}")