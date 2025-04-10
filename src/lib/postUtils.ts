// src/lib/postUtils.ts
import { supabase } from "./supabase";

export interface ArticleData {
  id?: string;
  user_id?: string;
  title: string;
  content: string;
  excerpt?: string | null;
  category?: string | null;
  slug?: string;
  published_at?: string;
  is_published?: boolean;
  view_count?: number;
  image_url?: string | null;
}

/**
 * Create a new article
 * @param article The article data to create
 * @returns The created article or null if there was an error
 */
export async function createArticle(
  article: Omit<
    ArticleData,
    "user_id" | "published_at" | "is_published" | "slug" | "view_count"
  >
): Promise<ArticleData | null> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return null;
    }

    // Generate a slug from the title
    const slug = article.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");

    // Generate an excerpt if not provided
    const excerpt =
      article.excerpt ||
      (article.content.length > 150
        ? article.content.substring(0, 150) + "..."
        : article.content);

    const fullArticle = {
      ...article,
      user_id: userData.user.id,
      slug,
      excerpt,
      is_published: true,
      published_at: new Date().toISOString(),
      view_count: 0,
    };

    // Use any to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("public_articles")
      .insert(fullArticle)
      .select()
      .single();

    if (error) {
      console.error("Error creating article:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createArticle:", error);
    return null;
  }
}

/**
 * Get all articles for the current user
 * @returns An array of articles or null if there was an error
 */
export async function getUserArticles(): Promise<ArticleData[] | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("Error getting user:", userError);
      return null;
    }

    // Use any to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("public_articles")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error getting articles:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserArticles:", error);
    return null;
  }
}

/**
 * Get all published articles for a specific user
 * @param userId The user ID to get articles for
 * @returns An array of articles or null if there was an error
 */
export async function getPublishedArticlesByUserId(
  userId: string
): Promise<ArticleData[] | null> {
  try {
    // Use any to bypass TypeScript checking
    const { data, error } = await (supabase as any)
      .from("public_articles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error getting articles:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getPublishedArticlesByUserId:", error);
    return null;
  }
}

/**
 * Add debugging function to help identify table mismatches
 */
export async function debugArticleTables(userId?: string): Promise<void> {
  try {
    console.log("------ Database Debug Info ------");

    // Get current user if userId not provided
    if (!userId) {
      const { data: userData } = await supabase.auth.getUser();
      userId = userData?.user?.id;
      console.log("Current user ID:", userId);
    }

    if (!userId) {
      console.log("No user ID available for debugging");
      return;
    }

    // Check posts table
    try {
      const { data: posts, error: postsError } = await (supabase as any)
        .from("posts")
        .select("*")
        .eq("user_id", userId);

      console.log("Posts table entries:", posts?.length || 0);
      console.log("Posts error:", postsError);
      if (posts?.length > 0) {
        console.log("Sample post:", posts[0]);
      }
    } catch (e) {
      console.log("Error checking posts table:", e);
    }

    // Check public_articles table
    try {
      const { data: articles, error: articlesError } = await (supabase as any)
        .from("public_articles")
        .select("*")
        .eq("user_id", userId);

      console.log("Public_articles table entries:", articles?.length || 0);
      console.log("Articles error:", articlesError);
      if (articles?.length > 0) {
        console.log("Sample article:", articles[0]);
      }
    } catch (e) {
      console.log("Error checking public_articles table:", e);
    }

    console.log("------ End Debug Info ------");
  } catch (error) {
    console.error("Debug error:", error);
  }
}
