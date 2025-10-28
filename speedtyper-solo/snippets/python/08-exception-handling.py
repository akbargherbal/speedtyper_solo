def divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print("Error: Cannot divide by zero.")
        return None
    except TypeError as e:
        print(f"Error: Invalid input type - {e}")
        return None
    else:
        print("Division successful.")
        return result
    finally:
        print("Execution finished.")

divide(10, 2)
divide(10, 0)
divide("10", 2)