class Dog:
    """A simple class representing a dog."""
    def __init__(self, name: str, breed: str):
        self.name = name
        self.breed = breed

    def bark(self) -> str:
        return f"{self.name} says woof!"

my_dog = Dog(name="Buddy", breed="Golden Retriever")
print(my_dog.bark())