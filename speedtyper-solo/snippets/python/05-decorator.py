import time
from functools import wraps

def timing_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        print(f"'{func.__name__}' took {end_time - start_time:.4f} seconds.")
        return result
    return wrapper

@timing_decorator
def slow_function():
    time.sleep(1)
    print("Function complete.")

slow_function()