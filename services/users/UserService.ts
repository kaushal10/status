import { supabase } from '../../libs/supabase';

export type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  available: boolean;
  created_at: string;
};

export const UserService = {
  async getUser(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, phone, available, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async createUser(
    userId: string,
    name: string
  ): Promise<UserProfile> {
    /*
     * Check if user already exists.
     * This can happen when switching test users or
     * if onboarding is retried after a previous success.
     */
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id, name, phone, available, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    // If user exists, update their name and return
    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userId)
        .select('id, name, phone, available, created_at')
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!updated) {
        throw new Error('Failed to update user profile');
      }

      return updated;
    }

    // Otherwise, create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
      })
      .select('id, name, phone, available, created_at')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
