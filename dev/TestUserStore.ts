import { Session } from '@supabase/supabase-js';

import { supabase } from '../libs/supabase';

export type TestUser = {
  id: string;
  label: string;
  session: Session;
};

let testUsers: TestUser[] = [];

export function getTestUsers(): TestUser[] {
  return [...testUsers];
}

export function getCurrentTestUser(): TestUser | null {
  const session = getCurrentSession();

  if (!session?.user) {
    return null;
  }

  return (
    testUsers.find(
      (user) => user.id === session.user.id
    ) ?? null
  );
}

export function getCurrentSession(): Session | null {
  /*
   * This is intentionally synchronous only as a
   * best-effort reference to the currently selected
   * session.
   *
   * The actual session is maintained by Supabase.
   */
  return currentSession;
}

let currentSession: Session | null = null;

export async function createTestUser(
  label: string
): Promise<TestUser> {
  /*
   * Create a completely separate anonymous
   * Supabase account.
   */
  const {
    data,
    error,
  } =
    await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (!data.session || !data.user) {
    throw new Error(
      'Anonymous authentication returned no session.'
    );
  }

  const testUser: TestUser = {
    id: data.user.id,
    label,
    session: data.session,
  };

  testUsers = [
    ...testUsers.filter(
      (user) => user.id !== testUser.id
    ),
    testUser,
  ];

  currentSession = data.session;

  return testUser;
}

export async function switchToTestUser(
  testUser: TestUser
): Promise<void> {
  const {
    error,
  } =
    await supabase.auth.setSession({
      access_token:
        testUser.session.access_token,
      refresh_token:
        testUser.session.refresh_token,
    });

  if (error) {
    throw error;
  }

  /*
   * Get the refreshed/current session from Supabase.
   */
  const {
    data,
  } =
    await supabase.auth.getSession();

  currentSession =
    data.session;

  /*
   * Store the refreshed session so that
   * subsequent switches use the latest tokens.
   */
  if (currentSession) {
    testUsers =
      testUsers.map(
        (user) => {
          if (
            user.id !==
            testUser.id
          ) {
            return user;
          }

          return {
            ...user,
            session:
              currentSession!,
          };
        }
      );
  }
}

export async function refreshTestUsers(): Promise<void> {
  const {
    data,
  } =
    await supabase.auth.getSession();

  currentSession =
    data.session;

  if (!currentSession) {
    return;
  }

  testUsers =
    testUsers.map(
      (user) => {
        if (
          user.id !==
          currentSession!.user.id
        ) {
          return user;
        }

        return {
          ...user,
          session:
            currentSession!,
        };
      }
    );
}