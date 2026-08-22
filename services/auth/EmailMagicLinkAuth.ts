import { supabase } from '../../libs/supabase';
import {
    AuthProvider
} from './AuthService';

export async function sendMagicLink(
  email: string
) {
  const { error } =
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo:
          'statusapp://login',
      },
    });

  if (error) {
    throw error;
  }
}

export const EmailMagicLinkAuth: AuthProvider = {
  async signIn() {
    throw new Error(
      'Email authentication requires an email address. Use sendMagicLink().'
    );
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

    return {
      id: user.id,
      email: user.email,
      isAnonymous:
        user.is_anonymous === true,
    };
  },
};