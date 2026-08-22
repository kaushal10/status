import {
    router,
    useLocalSearchParams,
} from 'expo-router';

import { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../libs/supabase';

export default function InviteScreen() {
  const { token } =
    useLocalSearchParams<{
      token: string;
    }>();

  const {
    currentUser,
    loading: authLoading,
    signIn,
  } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [inviterName, setInviterName] =
    useState<string | null>(null);

  useEffect(() => {
    loadInvite();
  }, [token]);

  async function loadInvite() {
    if (!token) {
      setError(
        'Invalid invite link.'
      );
      setLoading(false);
      return;
    }

    try {
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
          'Load friend invite error:',
          error
        );

        throw error;
      }

      if (
        !data ||
        data.length === 0
      ) {
        setError(
          'This invite is invalid or has expired.'
        );
        return;
      }

      setInviterName(
        data[0].user_name
      );
    } catch (error) {
      console.error(
        'Load invite error:',
        error
      );

      setError(
        'Could not load this invite.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFriend() {
    if (!token) {
      return;
    }

    setAdding(true);
    setError(null);

    try {
      /*
       * Make sure the person accepting
       * the invite has a Supabase user.
       *
       * Anonymous sign-in is currently
       * enough for our app.
       */
      if (!currentUser) {
        await signIn();
      }

      const {
        data,
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

      if (!data) {
        setError(
          'This invite is invalid, expired, or cannot be accepted.'
        );

        return;
      }

      /*
       * Friend relationship has now
       * been created in both directions.
       */
      router.replace(
        '/(tabs)'
      );
    } catch (error) {
      console.error(
        'Add friend error:',
        error
      );

      setError(
        'Could not add this friend.'
      );
    } finally {
      setAdding(false);
    }
  }

  if (
    loading ||
    authLoading
  ) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
          />

          <Text
            style={styles.message}
          >
            Loading invite...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.center}
        >
          <Text
            style={styles.title}
          >
            Invite unavailable
          </Text>

          <Text
            style={styles.message}
          >
            {error}
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              router.replace(
                '/(tabs)'
              )
            }
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Go home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.center}
      >
        <Text
          style={styles.title}
        >
          Friend invite
        </Text>

        <Text
          style={styles.message}
        >
          {inviterName}
        </Text>

        <Text
          style={styles.subMessage}
        >
          wants to add you as a friend.
        </Text>

        <Pressable
          style={[
            styles.button,
            adding &&
              styles.buttonDisabled,
          ]}
          onPress={
            handleAddFriend
          }
          disabled={adding}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            {adding
              ? 'Adding...'
              : 'Add friend'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#1C1B1F',
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 32,
    },

    title: {
      color: '#F5F5F5',
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 16,
    },

    message: {
      color: '#F5F5F5',
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },

    subMessage: {
      color: '#AAA7AE',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 32,
    },

    button: {
      width: '100%',
      height: 56,
      borderRadius: 18,
      backgroundColor:
        '#4CAF50',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    buttonDisabled: {
      backgroundColor:
        '#3A393D',
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
    },

    secondaryButton: {
      width: '100%',
      height: 56,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        '#4A484D',
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 20,
    },

    secondaryButtonText: {
      color: '#A5D6A7',
      fontSize: 16,
      fontWeight: '600',
    },
  });