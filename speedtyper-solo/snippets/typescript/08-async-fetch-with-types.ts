interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json() as Promise<Post[]>;
}

fetchPosts().then(posts => {
  console.log(`Fetched ${posts.length} posts.`);
  console.log(`Title of first post: ${posts[0].title}`);
});