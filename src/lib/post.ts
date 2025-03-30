// src/lib/posts.ts
// This file manages blog post data and provides functions to fetch and filter posts

// Define the Post type
export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  category: string[];
  featured?: boolean;
}

// Sample data for posts (in a real app, this would be fetched from a database or CMS)
const posts: Post[] = [
  {
    id: "1",
    title: "The Fall of Rome: Myths and Realities",
    slug: "fall-of-rome-myths-realities",
    date: "March 15, 2024",
    excerpt:
      "Exploring the complex factors that led to the decline of the Roman Empire and separating historical fact from fiction.",
    content: "Full content of the article would go here...",
    category: ["Ancient History", "Roman Empire"],
    featured: true,
  },
  {
    id: "2",
    title: "Medieval Medicine: More Advanced Than You Think",
    slug: "medieval-medicine-advancements",
    date: "March 10, 2024",
    excerpt:
      "Challenging common misconceptions about medical practices in the Middle Ages.",
    content: "Full content of the article would go here...",
    category: ["Medieval Period", "Medical History"],
    featured: true,
  },
  {
    id: "3",
    title: "The Real Story Behind the Cuban Missile Crisis",
    slug: "cuban-missile-crisis-real-story",
    date: "March 5, 2024",
    excerpt:
      "Declassified documents reveal new insights into how close the world came to nuclear war.",
    content: "Full content of the article would go here...",
    category: ["Cold War Era", "20th Century"],
    featured: true,
  },
  {
    id: "4",
    title: "Renaissance Art: The Hidden Symbolism",
    slug: "renaissance-art-hidden-symbolism",
    date: "February 28, 2024",
    excerpt:
      "A deep dive into the secret messages and symbols embedded in famous Renaissance paintings.",
    content: "Full content of the article would go here...",
    category: ["Renaissance", "Art History"],
  },
  {
    id: "5",
    title: "The Silk Road: Cultural Exchange Across Continents",
    slug: "silk-road-cultural-exchange",
    date: "February 22, 2024",
    excerpt:
      "How ancient trade routes shaped the development of civilizations from China to Europe.",
    content: "Full content of the article would go here...",
    category: ["Ancient History", "Medieval Period", "Trade History"],
  },
];

// Function to get all posts
export function getAllPosts(): Post[] {
  // Sort posts by date (newest first)
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Function to get a specific number of recent posts
export function getRecentPosts(count: number): Post[] {
  return getAllPosts().slice(0, count);
}

// Function to get featured posts
export function getFeaturedPosts(): Post[] {
  return getAllPosts().filter((post) => post.featured);
}

// Function to get a single post by slug
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

// Function to get posts by category
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((post) =>
    post.category.some((cat) => cat.toLowerCase() === category.toLowerCase())
  );
}

// Function to search posts
export function searchPosts(query: string): Post[] {
  const searchTerm = query.toLowerCase();
  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm)
  );
}
