// src/lib/favoritesUtils.ts
import { supabase } from "./supabase";

/**
 * Manages favorite articles functionality.
 * Currently using localStorage as a workaround until a proper database table is created.
 *
 * Future implementation should use a favorites table in Supabase with the following structure:
 * - id: uuid (primary key)
 * - user_id: uuid (references auth.users.id)
 * - article_id: uuid (references public_articles.id)
 * - created_at: timestamptz
 * - position: integer (to allow ordering of favorites)
 */

export interface Favorite {
  article_id: string;
  position: number;
}

/**
 * Get user's favorite articles (currently from localStorage)
 */
export function getUserFavorites(userId: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedFavorites = localStorage.getItem(`userFavorites_${userId}`);
    if (savedFavorites) {
      return JSON.parse(savedFavorites);
    }
  } catch (error) {
    console.error("Error getting favorites:", error);
  }

  return [];
}

/**
 * Save user's favorite articles (currently to localStorage)
 */
export function saveUserFavorites(
  userId: string,
  favorites: string[]
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(`userFavorites_${userId}`, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error("Error saving favorites:", error);
    return false;
  }
}

/**
 * Check if an article is a favorite
 */
export function isArticleFavorite(userId: string, articleId: string): boolean {
  const favorites = getUserFavorites(userId);
  return favorites.includes(articleId);
}

/**
 * Toggle article as favorite
 */
export function toggleFavorite(userId: string, articleId: string): boolean {
  const favorites = getUserFavorites(userId);

  if (favorites.includes(articleId)) {
    // Remove from favorites
    const newFavorites = favorites.filter((id) => id !== articleId);
    return saveUserFavorites(userId, newFavorites);
  } else {
    // Add to favorites (max 4)
    if (favorites.length >= 4) {
      return false; // Maximum reached
    }

    const newFavorites = [...favorites, articleId];
    return saveUserFavorites(userId, newFavorites);
  }
}

/**
 * SQL for future Supabase implementation:
 *
 * -- Create favorites table
 * CREATE TABLE public.article_favorites (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *   article_id UUID REFERENCES public.public_articles(id) ON DELETE CASCADE NOT NULL,
 *   position INTEGER NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
 *   UNIQUE(user_id, article_id),
 *   UNIQUE(user_id, position)
 * );
 *
 * -- Add RLS policies
 * ALTER TABLE public.article_favorites ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow users to manage their own favorites
 * CREATE POLICY "Users can manage their own favorites" ON public.article_favorites
 * FOR ALL USING (auth.uid() = user_id);
 *
 * -- Allow users to read others' favorites for profile displays
 * CREATE POLICY "Users can view others' favorites" ON public.article_favorites
 * FOR SELECT USING (true);
 */

/**
 * Future database implementation functions (commented out until ready)
 */

/* 
// Get user's favorite articles from database
export async function getFavoriteArticles(userId: string) {
  try {
    const { data, error } = await supabase
      .from('article_favorites')
      .select(`
        article_id,
        position,
        public_articles:article_id (
          id,
          title,
          slug,
          excerpt,
          image_url,
          published_at
        )
      `)
      .eq('user_id', userId)
      .order('position', { ascending: true })
      .limit(4);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching favorite articles:', error);
    return [];
  }
}

// Add an article to favorites
export async function addFavorite(userId: string, articleId: string, position: number) {
  try {
    // Check if already at maximum (4)
    const { count, error: countError } = await supabase
      .from('article_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (countError) throw countError;
    
    if (count >= 4) {
      throw new Error('Maximum of 4 favorites reached');
    }
    
    // Insert new favorite
    const { error } = await supabase
      .from('article_favorites')
      .insert({
        user_id: userId,
        article_id: articleId,
        position,
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
}

// Remove an article from favorites
export async function removeFavorite(userId: string, articleId: string) {
  try {
    const { error } = await supabase
      .from('article_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

// Update favorite positions
export async function updateFavoritePositions(userId: string, favorites: {article_id: string, position: number}[]) {
  try {
    // Use transaction to update all positions
    const { error } = await supabase.rpc('update_favorite_positions', {
      favorites_data: favorites,
      user_id: userId
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating favorite positions:', error);
    return false;
  }
}
*/
