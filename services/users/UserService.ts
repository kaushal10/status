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