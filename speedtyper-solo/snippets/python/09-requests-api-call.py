import requests

def get_user_data(user_id: int):
    api_url = f"https://jsonplaceholder.typicode.com/users/{user_id}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

user = get_user_data(1)
if user:
    print(f"User Name: {user.get('name')}")
    print(f"Email: {user.get('email')}")