import { router } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    Share,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { InviteService } from '../services/invites/InviteService';

export default function AddFriendScreen() {
  const [inviteLink, setInviteLink] =
    useState('');

  const [creating, setCreating] =
    useState(false);

  const [sharing, setSharing] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleCreateInvite =
    async () => {
      setError('');
      setCreating(true);

      try {
        const invite =
          await InviteService.createInvite();

        const link =
          `statusapp://invite/${invite.token}`;

        console.log(
          'FRIEND INVITE:',
          invite
        );

        console.log(
          'INVITE LINK:',
          link
        );

        setInviteLink(link);
      } catch (error) {
        console.error(
          'Create friend invite error:',
          error
        );

        setError(
          'Could not create invite.'
        );
      } finally {
        setCreating(false);
      }
    };

  const handleShare =
    async () => {
        if (!inviteLink) {
        return;
        }

        setError('');
        setSharing(true);

        try {
        await Share.share({
            message:
            `Add me as a friend on Status App:\n\n${inviteLink}`,
        });
        } catch (error) {
        console.error(
            'Share invite error:',
            error
        );

        setError(
            'Could not share invite.'
        );
        } finally {
        setSharing(false);
        }
    };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.content}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Text
            style={styles.backText}
          >
            ‹ Back
          </Text>
        </Pressable>

        <Text
          style={styles.title}
        >
          Add friend
        </Text>

        <Text
          style={styles.subtitle}
        >
          Create an invite and
          share it with your
          friend.
        </Text>

        {!inviteLink ? (
          <Pressable
            style={[
              styles.button,
              creating &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleCreateInvite
            }
            disabled={creating}
          >
            <Text
              style={
                styles.buttonText
              }
            >
              {creating
                ? 'Creating...'
                : 'Create invite'}
            </Text>
          </Pressable>
        ) : (
          <>
            <View
              style={styles.linkBox}
            >
              <Text
                style={
                  styles.linkLabel
                }
              >
                Invite link
              </Text>

              <Text
                style={styles.link}
                selectable
              >
                {inviteLink}
              </Text>
            </View>

            <Pressable
              style={[
                styles.button,
                sharing &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handleShare
              }
              disabled={sharing}
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                {sharing
                  ? 'Sharing...'
                  : 'Share invite'}
              </Text>
            </Pressable>
          </>
        )}

        {error ? (
          <Text
            style={styles.error}
          >
            {error}
          </Text>
        ) : null}
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

    content: {
      padding: 24,
      paddingTop: 40,
    },

    backButton: {
      marginBottom: 28,
    },

    backText: {
      color: '#A5D6A7',
      fontSize: 17,
      fontWeight: '600',
    },

    title: {
      color: '#F5F5F5',
      fontSize: 30,
      fontWeight: '700',
      marginBottom: 10,
    },

    subtitle: {
      color: '#AAA7AE',
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 28,
    },

    linkBox: {
      backgroundColor:
        '#29282D',
      borderRadius: 18,
      padding: 16,
      marginBottom: 20,
    },

    linkLabel: {
      color: '#AAA7AE',
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 8,
    },

    link: {
      color: '#F5F5F5',
      fontSize: 14,
      lineHeight: 20,
    },

    button: {
      height: 56,
      borderRadius: 18,
      backgroundColor:
        '#4CAF50',
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 20,
    },

    buttonDisabled: {
      backgroundColor:
        '#3A393D',
    },

    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    error: {
      color: '#FF8A80',
      fontSize: 14,
      marginTop: 16,
    },
  });