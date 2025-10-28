import asyncio

async def fetch_data(source: str) -> str:
    print(f"Start fetching from {source}...")
    await asyncio.sleep(1)  # Simulate network request
    print(f"Finished fetching from {source}.")
    return f"Data from {source}"

async def main():
    # Run multiple async tasks concurrently
    results = await asyncio.gather(
        fetch_data("API 1"),
        fetch_data("API 2")
    )
    print(results)

if __name__ == "__main__":
    asyncio.run(main())