# The 'with' statement ensures resources are managed correctly.
try:
    with open("example.txt", "w") as f:
        f.write("Hello, file!")
    # File is automatically closed here, even if errors occur.

    with open("example.txt", "r") as f:
        content = f.read()
        print(content)
except IOError as e:
    print(f"An error occurred: {e}")