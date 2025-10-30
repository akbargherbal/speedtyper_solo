// PATTERN: Error Handling with Types

try {
  JSON.parse("invalid json");
} catch (error) {
  if (error instanceof SyntaxError) {
    console.log("Syntax error:", error.message);
  } else if (error instanceof Error) {
    console.log("General error:", error.message);
  } else {
    console.log("Unknown error occurred");
  }
}

// PATTERN: Error Handling with Types

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

throw new NetworkError("Failed to connect");

// PATTERN: Error Handling with Types

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function fetchData(url: string): Result<string> {
  if (!url.startsWith("http")) {
    return { ok: false, error: new Error("Invalid URL") };
  }
  return { ok: true, value: "Data fetched" };
}

const result = fetchData("https://example.com");
if (result.ok) {
  console.log(result.value);
} else {
  console.log(result.error.message);
}

// PATTERN: Error Handling with Types

async function riskyOperation() {
  throw "Unexpected error";
}

try {
  await riskyOperation();
} catch (error) {
  if (typeof error === "string") {
    console.log("String error:", error);
  } else if (error instanceof Error) {
    console.log("Error object:", error.message);
  } else {
    console.log("Completely unknown error");
  }
}