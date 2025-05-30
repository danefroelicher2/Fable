// src/lib/SharedContentUtils.ts - UPDATED WITH PROPER CONVERSATION CREATION
import { supabase } from "@/lib/supabase";
import { sendMessage } from "./messageUtils";

export interface SharedContent {
  type: "article" | "post";
  id: string;
  title: string;
  url: string;
  author?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  excerpt?: string;
  image_url?: string;
  published_at?: string;
}

/**
 * Generate the same deterministic UUID as in messageUtils
 */
function generateConversationId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort();
  const combined = sortedIds.join("|");

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hashHex = Math.abs(hash).toString(16).padStart(8, "0");
  const uuid = `${hashHex.slice(0, 8)}-${hashHex.slice(0, 4)}-4${hashHex.slice(
    1,
    4
  )}-a${hashHex.slice(2, 5)}-${hashHex}${hashHex.slice(0, 4)}`;

  return uuid;
}

/**
 * Fetch full details for shared content
 */
export async function getSharedContentDetails(
  contentType: "article" | "post",
  contentId: string
): Promise<SharedContent | null> {
  try {
    if (contentType === "article") {
      const { data: article, error: articleError } = await (supabase as any)
        .from("public_articles")
        .select(
          `
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at,
          user_id
        `
        )
        .eq("id", contentId)
        .eq("is_published", true)
        .single();

      if (articleError) {
        console.error("Error fetching article:", articleError);
        return null;
      }

      const { data: author, error: authorError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", article.user_id)
        .single();

      if (authorError) {
        console.warn("Error fetching article author:", authorError);
      }

      return {
        type: "article",
        id: article.id,
        title: article.title,
        url: `/articles/${article.slug}`,
        author: author || undefined,
        excerpt: article.excerpt,
        image_url: article.image_url,
        published_at: article.published_at,
      };
    } else if (contentType === "post") {
      const { data: post, error: postError } = await (supabase as any)
        .from("community_posts")
        .select(
          `
          id,
          title,
          content,
          created_at,
          user_id,
          community_id,
          community:communities(name)
        `
        )
        .eq("id", contentId)
        .single();

      if (postError) {
        console.error("Error fetching post:", postError);
        return null;
      }

      const { data: author, error: authorError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", post.user_id)
        .single();

      if (authorError) {
        console.warn("Error fetching post author:", authorError);
      }

      const excerpt =
        post.content.length > 150
          ? post.content.substring(0, 150) + "..."
          : post.content;

      return {
        type: "post",
        id: post.id,
        title: post.title,
        url: `/communities/${post.community_id}/posts/${post.id}`,
        author: author || undefined,
        excerpt: excerpt,
        published_at: post.created_at,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting shared content details:", error);
    return null;
  }
}

/**
 * Send a shared content message
 */
export async function sendSharedContentMessage(
  recipientId: string,
  contentType: "article" | "post",
  contentId: string,
  personalMessage?: string
): Promise<boolean> {
  try {
    const contentDetails = await getSharedContentDetails(
      contentType,
      contentId
    );

    if (!contentDetails) {
      throw new Error("Could not fetch content details");
    }

    const sharedContentData = {
      type: contentDetails.type,
      id: contentDetails.id,
      title: contentDetails.title,
      url: contentDetails.url,
      excerpt: contentDetails.excerpt,
      image_url: contentDetails.image_url,
      author: contentDetails.author,
      published_at: contentDetails.published_at,
    };

    // UPDATED: Send empty message when no personal message
    const messageContent =
      personalMessage && personalMessage.trim() ? personalMessage : ""; // Empty string instead of title

    return await sendMessage(
      recipientId,
      messageContent,
      "shared_content",
      sharedContentData
    );
  } catch (error) {
    console.error("Error sending shared content message:", error);
    return false;
  }
}

/**
 * Get or create conversation between two users
 */
export async function getOrCreateConversation(
  user1Id: string,
  user2Id: string
) {
  return generateConversationId(user1Id, user2Id);
}

/**
 * Legacy function for backward compatibility
 */
export async function createSharedContentMessage(
  conversationId: string,
  senderId: string,
  contentType: "article" | "post",
  contentId: string,
  personalMessage?: string
) {
  console.warn(
    "createSharedContentMessage is deprecated, use sendSharedContentMessage instead"
  );
  throw new Error(
    "This function needs recipient ID - use sendSharedContentMessage instead"
  );
}
