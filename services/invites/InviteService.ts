import { supabase } from '../../libs/supabase';

export type FriendInvite = {
  id: string;
  token: string;
  createdBy: string;
  expiresAt: string;
  createdAt: string;
};

export type FriendInviteDetails = {
  id: string;
  userId: string;
  userName: string;
  expiresAt: string;
};

function generateToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (character) => {
      const random = Math.floor(
        Math.random() * 16
      );

      const value =
        character === 'x'
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
}

export const InviteService = {
  async createInvite(
    expiresInHours = 24
  ): Promise<FriendInvite> {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        'You must be signed in to create an invite.'
      );
    }

    const token =
      generateToken();

    const expiresAt =
      new Date(
        Date.now() +
          expiresInHours *
            60 *
            60 *
            1000
      ).toISOString();

    const {
      data,
      error,
    } = await supabase
      .from('friend_invites')
      .insert({
        token,
        created_by: user.id,
        expires_at:
          expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error(
        'Create friend invite error:',
        error
      );

      throw error;
    }

    return {
      id: data.id,
      token: data.token,
      createdBy:
        data.created_by,
      expiresAt:
        data.expires_at,
      createdAt:
        data.created_at,
    };
  },

  async getInvite(
    token: string
  ): Promise<
    FriendInviteDetails | null
  > {
    const {
      data,
      error,
    } = await supabase.rpc(
      'get_friend_invite_details',
      {
        invite_token: token,
      }
    );

    if (error) {
      console.error(
        'Get friend invite error:',
        error
      );

      throw error;
    }

    if (
      !data ||
      data.length === 0
    ) {
      return null;
    }

    const invite =
      data[0];

    return {
      id: invite.id,
      userId:
        invite.user_id,
      userName:
        invite.user_name,
      expiresAt:
        invite.expires_at,
    };
  },

  async acceptInvite(
    token: string
  ): Promise<void> {
    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        'You must be signed in to accept an invite.'
      );
    }

    const {
      error,
    } = await supabase.rpc(
      'accept_friend_invite',
      {
        invite_token: token,
      }
    );

    if (error) {
      console.error(
        'Accept friend invite error:',
        error
      );

      throw error;
    }
  },
};