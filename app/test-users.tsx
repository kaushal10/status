import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { supabase } from '../libs/supabase';

type TestUser = {
  id: string;
  label: string;
  accessToken: string;
  refreshToken: string;
};

const STORAGE_KEY =
  '@status_app_test_users';

export default function TestUsersScreen() {
  const [users, setUsers] =
    useState<TestUser[]>([]);

  const [label, setLabel] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [switching, setSwitching] =
    useState(false);

  useEffect(() => {
    loadTestUsers();
  }, []);

  async function loadTestUsers() {
    try {
      const stored =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) {
        setUsers([]);
        return;
      }

      const parsed =
        JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setUsers(parsed);
      }
    } catch (error) {
      console.error(
        'Load test users error:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveTestUsers(
    updatedUsers: TestUser[]
  ) {
    setUsers(updatedUsers);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        updatedUsers
      )
    );
  }

  async function createTestUser() {
    const trimmedLabel =
      label.trim();

    if (!trimmedLabel) {
      Alert.alert(
        'Enter a name',
        'Give this test user a name first.'
      );
      return;
    }

    setCreating(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth
          .signInAnonymously();

      if (error) {
        throw error;
      }

      if (
        !data.user ||
        !data.session
      ) {
        throw new Error(
          'Supabase did not return a user session.'
        );
      }

      /*
       * Create the application profile
       * immediately. Test users don't need
       * to go through normal onboarding.
       */
      const {
        error:
          profileError,
      } =
        await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: trimmedLabel,
            available: false,
          });

      if (profileError) {
        throw profileError;
      }

      const newUser: TestUser = {
        id: data.user.id,
        label: trimmedLabel,
        accessToken:
          data.session
            .access_token,
        refreshToken:
          data.session
            .refresh_token,
      };

      const updatedUsers = [
        ...users,
        newUser,
      ];

      await saveTestUsers(
        updatedUsers
      );

      setLabel('');

      console.log(
        'Created test user:',
        {
          id: newUser.id,
          label: newUser.label,
        }
      );

      /*
       * Profile already exists, so go
       * directly into the application.
       */
      router.replace(
        '/(tabs)'
      );
    } catch (error) {
      console.error(
        'Create test user error:',
        error
      );

      Alert.alert(
        'Could not create test user',
        'Please check the console for details.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function switchUser(
    user: TestUser
  ) {
    try {
      setSwitching(true);

      const {
        error,
      } =
        await supabase.auth
          .setSession({
            access_token:
              user.accessToken,
            refresh_token:
              user.refreshToken,
          });

      if (error) {
        throw error;
      }

      /*
       * Make sure the selected user
       * actually has a profile.
       */
      const {
        data: profile,
        error:
          profileError,
      } =
        await supabase
          .from('users')
          .select('id')
          .eq(
            'id',
            user.id
          )
          .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        Alert.alert(
          'Profile missing',
          `${user.label} does not have a profile yet.`
        );
        setSwitching(false);
        return;
      }

      /*
       * Wait a moment for AuthContext to process
       * the session change before navigating.
       * This ensures FriendContext sees the new user.
       */
      await new Promise(resolve => setTimeout(resolve, 500));

      router.replace(
        '/(tabs)'
      );
    } catch (error) {
      console.error(
        'Switch test user error:',
        error
      );

      Alert.alert(
        'Could not switch user',
        'This test user`s session may have expired. Create a new test user if necessary.'
      );
    } finally {
      setSwitching(false);
    }
  }

  async function removeTestUser(
    user: TestUser
  ) {
    Alert.alert(
      'Remove test user?',
      `${user.label} will be removed from this device's test-user list. The Supabase account itself will NOT be deleted.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress:
            async () => {
              const updatedUsers =
                users.filter(
                  (item) =>
                    item.id !==
                    user.id
                );

              await saveTestUsers(
                updatedUsers
              );
            },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Text
        style={styles.title}
      >
        Test Users
      </Text>

      <Text
        style={styles.subtitle}
      >
        Create and reuse development accounts for testing multi-user features.
      </Text>

      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="Test user name"
        placeholderTextColor="#77747A"
        autoCapitalize="words"
        editable={!creating && !switching}
      />

      <Pressable
        style={[
          styles.createButton,
          (creating || switching) &&
            styles.buttonDisabled,
        ]}
        onPress={
          createTestUser
        }
        disabled={creating || switching}
      >
        <Text
          style={
            styles.buttonText
          }
        >
          {creating
            ? 'Creating...'
            : '+ Create test user'}
        </Text>
      </Pressable>

      <Text
        style={styles.sectionTitle}
      >
        Existing test users
      </Text>

      {users.length === 0 ? (
        <Text
          style={styles.empty}
        >
          No test users created yet.
        </Text>
      ) : (
        users.map(
          (user) => (
            <View
              key={user.id}
              style={
                styles.userCard
              }
            >
              <Pressable
                style={
                  styles.userMain
                }
                onPress={() =>
                  switchUser(
                    user
                  )
                }
                disabled={switching}
              >
                <Text
                  style={
                    styles.userName
                  }
                >
                  {user.label}
                </Text>

                <Text
                  style={
                    styles.userId
                  }
                >
                  {user.id}
                </Text>

                <Text
                  style={
                    styles.switchText
                  }
                >
                  {switching ? 'Switching...' : 'Tap to switch'}
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  removeTestUser(
                    user
                  )
                }
                disabled={switching}
              >
                <Text
                  style={
                    styles.deleteText
                  }
                >
                  Remove
                </Text>
              </Pressable>
            </View>
          )
        )
      )}
    </SafeAreaView>
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

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#1C1B1F',
    },

    title: {
      color: '#F5F5F5',
      fontSize: 30,
      fontWeight: '700',
    },

    subtitle: {
      color: '#AAA7AE',
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      marginBottom: 24,
    },

    input: {
      height: 56,
      borderRadius: 16,
      backgroundColor:
        '#29282D',
      color: '#F5F5F5',
      paddingHorizontal: 18,
      fontSize: 16,
      marginBottom: 12,
    },

    createButton: {
      height: 56,
      borderRadius: 18,
      backgroundColor:
        '#4CAF50',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    sectionTitle: {
      color: '#F5F5F5',
      fontSize: 19,
      fontWeight: '600',
      marginTop: 32,
      marginBottom: 14,
    },

    empty: {
      color: '#AAA7AE',
      fontSize: 15,
    },

    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#29282D',
      borderRadius: 18,
      marginBottom: 12,
      overflow: 'hidden',
    },

    userMain: {
      flex: 1,
      padding: 18,
    },

    userName: {
      color: '#F5F5F5',
      fontSize: 18,
      fontWeight: '600',
    },

    userId: {
      color: '#77747A',
      fontSize: 10,
      marginTop: 7,
    },

    switchText: {
      color: '#A5D6A7',
      fontSize: 13,
      fontWeight: '600',
      marginTop: 9,
    },

    deleteButton: {
      paddingHorizontal: 16,
      paddingVertical: 18,
    },

    deleteText: {
      color: '#FF8A80',
      fontSize: 13,
      fontWeight: '600',
    },
  });
