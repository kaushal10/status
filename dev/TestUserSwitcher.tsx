import { useEffect, useState } from 'react';

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    createTestUser,
    getTestUsers,
    switchToTestUser,
    TestUser,
} from './TestUserStore';

type Props = {
  onClose?: () => void;
};

export default function TestUserSwitcher({
  onClose,
}: Props) {
  const [
    users,
    setUsers,
  ] =
    useState<TestUser[]>(
      []
    );

  const [
    switching,
    setSwitching,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    setUsers(
      getTestUsers()
    );
  }, []);

  async function handleCreate(
    label: string
  ) {
    try {
      setError(null);

      const user =
        await createTestUser(
          label
        );

      setUsers(
        getTestUsers()
      );

      console.log(
        `Created ${label}:`,
        user.id
      );
    } catch (error) {
      console.error(
        'Create test user error:',
        error
      );

      setError(
        'Could not create test user.'
      );
    }
  }

  async function handleSwitch(
    user: TestUser
  ) {
    try {
      setError(null);
      setSwitching(true);

      await switchToTestUser(
        user
      );

      /*
       * Give AuthContext / FriendContext
       * a moment to react to the session
       * change before closing.
       */
      setTimeout(() => {
        setSwitching(false);
        onClose?.();
      }, 300);
    } catch (error) {
      console.error(
        'Switch test user error:',
        error
      );

      setError(
        'Could not switch user.'
      );

      setSwitching(false);
    }
  }

  return (
    <View
      style={styles.container}
    >
      <Text
        style={styles.title}
      >
        Test users
      </Text>

      <Text
        style={styles.subtitle}
      >
        Development only
      </Text>

      {users.map(
        (user) => (
          <Pressable
            key={user.id}
            style={
              styles.userButton
            }
            onPress={() =>
              handleSwitch(
                user
              )
            }
            disabled={
              switching
            }
          >
            <Text
              style={
                styles.userLabel
              }
            >
              {user.label}
            </Text>

            <Text
              style={
                styles.userId
              }
            >
              {user.id.slice(
                0,
                8
              )}
              ...
            </Text>
          </Pressable>
        )
      )}

      <Pressable
        style={
          styles.createButton
        }
        onPress={() =>
          handleCreate(
            users.length ===
              0
              ? 'User A'
              : users.length ===
                1
              ? 'User B'
              : `User ${
                  users.length +
                  1
                }`
          )
        }
        disabled={
          switching
        }
      >
        <Text
          style={
            styles.createText
          }
        >
          + Create test user
        </Text>
      </Pressable>

      {error ? (
        <Text
          style={styles.error}
        >
          {error}
        </Text>
      ) : null}

      {onClose ? (
        <Pressable
          onPress={onClose}
          style={
            styles.closeButton
          }
        >
          <Text
            style={
              styles.closeText
            }
          >
            Close
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#1C1B1F',
      padding: 24,
      paddingTop: 50,
    },

    title: {
      color: '#F5F5F5',
      fontSize: 28,
      fontWeight: '700',
    },

    subtitle: {
      color: '#AAA7AE',
      fontSize: 14,
      marginTop: 5,
      marginBottom: 28,
    },

    userButton: {
      backgroundColor:
        '#29282D',
      borderRadius: 18,
      padding: 18,
      marginBottom: 10,
    },

    userLabel: {
      color: '#F5F5F5',
      fontSize: 17,
      fontWeight: '600',
    },

    userId: {
      color: '#77747A',
      fontSize: 12,
      marginTop: 5,
    },

    createButton: {
      height: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        '#4A484D',
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 10,
    },

    createText: {
      color: '#A5D6A7',
      fontSize: 15,
      fontWeight: '600',
    },

    error: {
      color: '#FF8A80',
      marginTop: 16,
    },

    closeButton: {
      marginTop: 30,
      alignItems: 'center',
    },

    closeText: {
      color: '#AAA7AE',
      fontSize: 15,
    },
  });