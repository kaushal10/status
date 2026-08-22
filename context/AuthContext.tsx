import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import {
    AuthProvider as AuthProviderInterface,
    AuthUser,
} from '../services/auth/AuthService';

import { AnonymousAuth } from '../services/auth/AnonymousAuth';

import {
    UserProfile,
    UserService,
} from '../services/users/UserService';

import { supabase } from '../libs/supabase';

type AuthContextValue = {
  currentUser:
    | AuthUser
    | null;

  profile:
    | UserProfile
    | null;

  loading: boolean;

  signIn: () => Promise<void>;

  signOut: () => Promise<void>;

  refreshProfile: () => Promise<void>;
};

const AuthContext =
  createContext<
    AuthContextValue | null
  >(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<
      AuthUser | null
    >(null);

  const [
    profile,
    setProfile,
  ] =
    useState<
      UserProfile | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const provider: AuthProviderInterface =
    AnonymousAuth;

  async function loadProfile(
    user: AuthUser | null
  ) {
    if (!user) {
      setProfile(null);
      return;
    }

    const existingProfile =
      await UserService.getUser(
        user.id
      );

    setProfile(
      existingProfile
    );
  }

  async function applyUser(
    user: AuthUser | null
  ) {
    setCurrentUser(
      user
    );

    await loadProfile(
      user
    );
  }

  async function initialize() {
    try {
      const user =
        await provider.getCurrentUser();

      await applyUser(
        user
      );
    } catch (error) {
      console.error(
        'Auth initialization error:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    initialize();

    /*
     * Important:
     *
     * This allows our development test-user
     * switcher to change the Supabase session
     * and have the rest of the application
     * automatically follow the new user.
     *
     * This is also useful normal auth behavior,
     * so it is not test-specific code.
     */
    const {
      data:
        subscription,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          const user =
            session?.user
              ? {
                  id: session
                    .user.id,
                  email:
                    session.user
                      .email,
                  isAnonymous:
                    session.user
                      .is_anonymous ===
                    true,
                }
              : null;

          await applyUser(
            user
          );
        }
      );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function signIn() {
    setLoading(true);

    try {
      const user =
        await provider.signIn();

      await applyUser(
        user
      );
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await provider.signOut();

    setCurrentUser(
      null
    );

    setProfile(
      null
    );
  }

  async function refreshProfile() {
    await loadProfile(
      currentUser
    );
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}