async function fetchUserData(userId) {
  const url = `https://jsonplaceholder.typicode.com/users/${userId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const userData = await response.json();
    console.log(userData.name);
  } catch (error) {
    console.error("Could not fetch user data:", error);
  }
}

fetchUserData(1);