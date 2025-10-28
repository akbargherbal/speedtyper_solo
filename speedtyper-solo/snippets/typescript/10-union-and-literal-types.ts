type Status = "loading" | "success" | "error";

let currentStatus: Status;

currentStatus = "loading";
console.log(`Status: ${currentStatus}`);

currentStatus = "success";
console.log(`Status: ${currentStatus}`);

// This would cause a TypeScript error:
// currentStatus = "failed";