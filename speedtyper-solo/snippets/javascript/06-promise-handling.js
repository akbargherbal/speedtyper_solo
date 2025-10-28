function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("Starting...");

delay(1000)
  .then(() => {
    console.log("One second has passed.");
    return delay(1000);
  })
  .then(() => {
    console.log("Two seconds have passed.");
  })
  .catch(error => {
    console.error("An error occurred:", error);
  });