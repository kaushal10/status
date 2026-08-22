import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { supabase } from '../libs/supabase';

import {
    Friend,
    User,
} from '../types';

import { useAuth } from './AuthContext';

type FriendContextType = {
  users: User[];
  friends: Friend[];
  currentUser:
    | User
    | undefined;

  loading: boolean;

  addFriend: (
    phone: string
  ) => Promise<boolean>;

  removeFriend: (
    friendId: string
  ) => Promise<void>;

  updateUserStatus: (
    userId: string,
    available: boolean
  ) => Promise<void>;
};

const FriendContext =
  createContext<FriendContextType | null>(
    null
  );

export function FriendProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentUser: authUser,
  } = useAuth();

  const [users, setUsers] =
    useState<User[]>([]);

  const [friends, setFriends] =
    useState<Friend[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadData() {
    if (!authUser) {
      setUsers([]);
      setFriends([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    /*
     * Load our own user profile.
     *
     * maybeSingle() is intentional.
     *
     * A newly authenticated anonymous
     * user may not have completed
     * onboarding yet, so the users table
     * can legitimately contain zero rows.
     */
    const {
      data: userData,
      error: userError,
    } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (userError) {
      console.error(
        'Current user error:',
        userError
      );
    }

    /*
     * If the user has not completed
     * onboarding yet, there is no reason
     * to load the friend list.
     */
    if (!userData) {
      setUsers([]);
      setFriends([]);
      setLoading(false);
      return;
    }

    /*
     * Load friends through the secure
     * database function.
     */
    const {
      data: friendUsers,
      error: friendError,
    } = await supabase.rpc(
      'get_my_friends'
    );

    if (friendError) {
      console.error(
        'Friends error:',
        friendError
      );
    }

    setUsers([
      userData,
    ]);

    setFriends(
      friendUsers ?? []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [authUser]);

  const currentUser =
    users.find(
      (user) =>
        user.id ===
        authUser?.id
    );

  const addFriend = async (
    phone: string
  ): Promise<boolean> => {
    const trimmedPhone =
      phone.trim();

    if (!trimmedPhone) {
      return false;
    }

    if (!authUser) {
      return false;
    }

    const {
      error,
    } = await supabase.rpc(
      'add_friend_by_phone',
      {
        friend_phone:
          trimmedPhone,
      }
    );

    if (error) {
      console.error(
        'Add friend error:',
        error
      );

      return false;
    }

    /*
     * Reload the friend list so the
     * newly-added friend immediately
     * appears on the home screen.
     */
    await loadData();

    return true;
  };

  const removeFriend =
    async (
      friendId: string
    ): Promise<void> => {
      if (!authUser) {
        return;
      }

      const {
        error,
      } = await supabase.rpc(
        'remove_friend',
        {
          friend_user_id:
            friendId,
        }
      );

      if (error) {
        console.error(
          'Remove friend error:',
          error
        );

        return;
      }

      setFriends(
        (currentFriends) =>
          currentFriends.filter(
            (friend) =>
              friend.id !==
              friendId
          )
      );
    };

  const updateUserStatus =
    async (
      userId: string,
      available: boolean
    ): Promise<void> => {
      const {
        error,
      } = await supabase
        .from('users')
        .update({
          available,
        })
        .eq(
          'id',
          userId
        );

      if (error) {
        console.error(
          'Status update error:',
          error
        );

        return;
      }

      /*
       * Update our own status locally.
       */
      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (user) => {
              if (
                user.id !==
                userId
              ) {
                return user;
              }

              return {
                ...user,
                available,
              };
            }
          )
      );

      /*
       * If the changed user also exists
       * in our friend list, keep that copy
       * consistent too.
       */
      setFriends(
        (currentFriends) =>
          currentFriends.map(
            (friend) => {
              if (
                friend.id !==
                userId
              ) {
                return friend;
              }

              return {
                ...friend,
                available,
              };
            }
          )
      );
    };

  return (
    <FriendContext.Provider
      value={{
        users,
        friends,
        currentUser,
        loading,
        addFriend,
        removeFriend,
        updateUserStatus,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context =
    useContext(
      FriendContext
    );

  if (!context) {
    throw new Error(
      'useFriends must be used inside FriendProvider'
    );
  }

  return context;
}