// src/lib/messageUtils.ts - FIXED WITH PROPER DUPLICATE HANDLING
import { supabase } from "./supabase";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  conversation_id: string;
  message_type?: string;
  shared_content?: any;
  sender_profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  recipient_profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ConversationSummary {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

/**
 * Generate a deterministic UUID for conversations between two users
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
 * Get or create a conversation between two users
 * FIXED: Handle unique constraint violations properly
 */
async function getOrCreateConversation(
  userId1: string,
  userId2: string
): Promise<string> {
  try {
    const conversationId = generateConversationId(userId1, userId2);
    const sortedIds = [userId1, userId2].sort();

    // First, try to find existing conversation by user IDs (more reliable than ID lookup)
    const { data: existingConversation, error: findError } = await (
      supabase as any
    )
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${sortedIds[0]},user2_id.eq.${sortedIds[1]}),and(user1_id.eq.${sortedIds[1]},user2_id.eq.${sortedIds[0]})`
      )
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("Error finding conversation:", findError);
    }

    if (existingConversation) {
      // Conversation already exists, return its ID
      return existingConversation.id;
    }

    // Try to create new conversation
    try {
      const { data: newConversation, error: createError } = await (
        supabase as any
      )
        .from("conversations")
        .insert({
          id: conversationId,
          user1_id: sortedIds[0],
          user2_id: sortedIds[1],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        // Check if it's a duplicate key error
        if (createError.code === "23505") {
          console.log(
            "Conversation already exists (duplicate key), trying to find it again..."
          );

          // Another process created it, try to find it again
          const { data: foundConversation, error: refindError } = await (
            supabase as any
          )
            .from("conversations")
            .select("id")
            .or(
              `and(user1_id.eq.${sortedIds[0]},user2_id.eq.${sortedIds[1]}),and(user1_id.eq.${sortedIds[1]},user2_id.eq.${sortedIds[0]})`
            )
            .single();

          if (refindError) {
            console.error(
              "Error refinding conversation after duplicate:",
              refindError
            );
            throw refindError;
          }

          if (foundConversation) {
            return foundConversation.id;
          } else {
            // Last resort: return the generated ID since it should exist
            return conversationId;
          }
        } else {
          throw createError;
        }
      }

      return conversationId;
    } catch (insertError) {
      console.error("Error creating conversation:", insertError);
      throw insertError;
    }
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    throw error;
  }
}

/**
 * Send a message to another user
 */
export async function sendMessage(
  recipientId: string,
  content: string,
  messageType: string = "text",
  sharedContent?: any
): Promise<boolean> {
  try {
    if (!content.trim() && messageType !== "shared_content") {
      throw new Error("Message content cannot be empty");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to send messages");
    }

    // Validate that recipientId is valid
    if (!recipientId || recipientId === "null" || recipientId.trim() === "") {
      throw new Error("Invalid recipient ID");
    }

    // Get or create conversation first
    const conversationId = await getOrCreateConversation(
      userData.user.id,
      recipientId
    );

    // Create message object
    const messageData: any = {
      sender_id: userData.user.id,
      recipient_id: recipientId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
      conversation_id: conversationId,
      message_type: messageType,
    };

    // Add shared content if provided
    if (sharedContent) {
      messageData.shared_content = sharedContent;
    }

    // Insert the message
    const { error } = await (supabase as any)
      .from("messages")
      .insert(messageData);

    if (error) {
      console.error("Error inserting message:", error);
      throw error;
    }

    // Update conversation timestamp (ignore errors here as it's not critical)
    try {
      await (supabase as any)
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } catch (updateError) {
      console.warn("Could not update conversation timestamp:", updateError);
      // Don't throw here, message was sent successfully
    }

    return true;
  } catch (error: any) {
    console.error("Error sending message:", error);
    return false;
  }
}

/**
 * Get all messages between current user and another user
 */
export async function getConversation(otherUserId: string): Promise<Message[]> {
  try {
    if (!otherUserId || otherUserId === "null" || otherUserId.trim() === "") {
      console.error("Invalid otherUserId:", otherUserId);
      return [];
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view messages");
    }

    const currentUserId = userData.user.id;

    // Find conversation by user IDs instead of generating ID
    const sortedIds = [currentUserId, otherUserId].sort();
    const { data: conversation, error: convError } = await (supabase as any)
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${sortedIds[0]},user2_id.eq.${sortedIds[1]}),and(user1_id.eq.${sortedIds[1]},user2_id.eq.${sortedIds[0]})`
      )
      .single();

    if (convError && convError.code !== "PGRST116") {
      console.error("Error finding conversation:", convError);
      throw convError;
    }

    if (!conversation) {
      // No conversation exists yet
      return [];
    }

    // Get messages for this conversation
    const { data: messagesData, error: messagesError } = await (supabase as any)
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    if (!messagesData || messagesData.length === 0) {
      return [];
    }

    // Get profile data for both users
    const userIds = [currentUserId, otherUserId].filter(
      (id) => id && id !== "null"
    );
    let profiles: Record<string, any> = {};

    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      } else if (profilesData) {
        profilesData.forEach((profile: any) => {
          profiles[profile.id] = profile;
        });
      }
    } catch (profileError) {
      console.error("Error in profile fetch:", profileError);
    }

    // Add profile data to messages
    const messagesWithProfiles = messagesData.map((message: any) => {
      const enrichedMessage: Message = {
        ...message,
        sender_profile: profiles[message.sender_id] || null,
        recipient_profile: profiles[message.recipient_id] || null,
      };
      return enrichedMessage;
    });

    return messagesWithProfiles;
  } catch (error: any) {
    console.error("Error getting conversation:", error);
    return [];
  }
}

/**
 * Get a list of unique users the current user has conversations with
 */
export async function getConversations(): Promise<ConversationSummary[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view conversations");
    }

    const currentUserId = userData.user.id;

    // Get all conversations involving the current user
    const { data: conversationsData, error: conversationsError } = await (
      supabase as any
    )
      .from("conversations")
      .select("*")
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .order("updated_at", { ascending: false });

    if (conversationsError) {
      console.error("Error fetching conversations:", conversationsError);
      throw conversationsError;
    }

    if (!conversationsData || conversationsData.length === 0) {
      return [];
    }

    // Get the latest message for each conversation and user profiles
    const conversationSummaries: ConversationSummary[] = [];

    for (const conversation of conversationsData) {
      try {
        // Determine the other user ID
        const otherUserId =
          conversation.user1_id === currentUserId
            ? conversation.user2_id
            : conversation.user1_id;

        if (!otherUserId || otherUserId === "null") {
          continue;
        }

        // Get the latest message for this conversation
        const { data: latestMessage, error: messageError } = await (
          supabase as any
        )
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (messageError && messageError.code !== "PGRST116") {
          console.error("Error fetching latest message:", messageError);
          continue;
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching user profile:", profileError);
          continue;
        }

        // Count unread messages
        const { count: unreadCount, error: unreadError } = await (
          supabase as any
        )
          .from("messages")
          .select("id", { count: "exact" })
          .eq("conversation_id", conversation.id)
          .eq("recipient_id", currentUserId)
          .eq("is_read", false);

        if (unreadError) {
          console.error("Error counting unread messages:", unreadError);
        }

        conversationSummaries.push({
          user_id: otherUserId,
          username: userProfile?.username || null,
          full_name: userProfile?.full_name || null,
          avatar_url: userProfile?.avatar_url || null,
          last_message: latestMessage?.content || "",
          last_message_date:
            latestMessage?.created_at || conversation.updated_at,
          unread_count: unreadCount || 0,
        });
      } catch (error) {
        console.error("Error processing conversation:", error);
        continue;
      }
    }

    return conversationSummaries;
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    return [];
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  otherUserId: string
): Promise<boolean> {
  try {
    if (!otherUserId || otherUserId === "null" || otherUserId.trim() === "") {
      console.error("Invalid otherUserId for marking as read:", otherUserId);
      return false;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to update messages");
    }

    const currentUserId = userData.user.id;

    // Find conversation by user IDs
    const sortedIds = [currentUserId, otherUserId].sort();
    const { data: conversation, error: convError } = await (supabase as any)
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${sortedIds[0]},user2_id.eq.${sortedIds[1]}),and(user1_id.eq.${sortedIds[1]},user2_id.eq.${sortedIds[0]})`
      )
      .single();

    if (convError && convError.code !== "PGRST116") {
      console.error("Error finding conversation:", convError);
      throw convError;
    }

    if (!conversation) {
      // No conversation exists, nothing to mark as read
      return true;
    }

    const { error } = await (supabase as any)
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversation.id)
      .eq("recipient_id", currentUserId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return false;
  }
}

/**
 * Mark all messages as read for the current user
 */
export async function markAllMessagesAsRead(): Promise<boolean> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to update messages");
    }

    const { error } = await (supabase as any)
      .from("messages")
      .update({ is_read: true })
      .eq("recipient_id", userData.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all messages as read:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error marking all messages as read:", error);
    return false;
  }
}

/**
 * Get unread message count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return 0;
    }

    const { count, error } = await (supabase as any)
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userData.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error getting unread message count:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
