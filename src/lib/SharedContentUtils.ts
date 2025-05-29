// src/lib/sharedContentUtils.ts
import { supabase } from "@/lib/supabase";

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
 * Fetch full details for shared content
 */
export async function getSharedContentDetails(
  contentType: "article" | "post",
  contentId: string
): Promise<SharedContent | null> {
  try {
    if (contentType === "article") {
      // Fetch article details
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

      // Fetch author details
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
      // Fetch community post details
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

      // Fetch author details
      const { data: author, error: authorError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", post.user_id)
        .single();

      if (authorError) {
        console.warn("Error fetching post author:", authorError);
      }

      // Create excerpt from content (first 150 chars)
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
 * Create a rich shared content message
 */
export async function createSharedContentMessage(
  conversationId: string,
  senderId: string,
  contentType: "article" | "post",
  contentId: string,
  personalMessage?: string
) {
  try {
    // Get full content details
    const contentDetails = await getSharedContentDetails(
      contentType,
      contentId
    );

    if (!contentDetails) {
      throw new Error("Could not fetch content details");
    }

    // Create the message with structured shared content data
    const messageData = {
      conversation_id: conversationId,
      sender_id: senderId,
      content: personalMessage || `Shared: ${contentDetails.title}`,
      created_at: new Date().toISOString(),
      message_type: "shared_content",
      shared_content: {
        type: contentDetails.type,
        id: contentDetails.id,
        title: contentDetails.title,
        url: contentDetails.url,
        excerpt: contentDetails.excerpt,
        image_url: contentDetails.image_url,
        author: contentDetails.author,
        published_at: contentDetails.published_at,
      },
    };

    const { data, error } = await (supabase as any)
      .from("messages")
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await (supabase as any)
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  } catch (error) {
    console.error("Error creating shared content message:", error);
    throw error;
  }
}

/**
 * Get or create conversation between two users
 */
export async function getOrCreateConversation(
  user1Id: string,
  user2Id: string
) {
  try {
    // Check if conversation already exists
    const { data: existingConversation, error: conversationError } = await (
      supabase as any
    )
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`
      )
      .maybeSingle();

    if (conversationError) throw conversationError;

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const { data: newConversation, error: newConversationError } = await (
      supabase as any
    )
      .from("conversations")
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (newConversationError) throw newConversationError;

    return newConversation.id;
  } catch (error) {
    console.error("Error getting or creating conversation:", error);
    throw error;
  }
}
