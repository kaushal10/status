import { supabase } from '../../libs/supabase';
import {
    AuthProvider,
    AuthUser,
} from './AuthService';

function mapUser(user: any): AuthUser {
  return {
    id: user.id,
    email: user.email,
    isAnonymous: user.is_anonymous === true,
  };
}

export const AnonymousAuth: AuthProvider = {
  async signIn() {
    const {
      data,
      error,
    } = await supabase.auth.signInAnonymously();

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(
        'Anonymous authentication returned no user'
      );
    }

    return mapUser(data.user);
  },

  async signOut() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    return mapUser(user);
  },
};