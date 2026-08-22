import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useGroups } from '../context/GroupContext';
import { InviteService } from '../services/invites/InviteService';

export default function CreateGroupScreen() {
  const [name, setName] =
    useState('');

  const [creating, setCreating] =
    useState(false);

  const { addGroup } =
    useGroups();

  const handleCreate =
    async () => {
      const trimmedName =
        name.trim();

      if (!trimmedName || creating) {
        return;
      }

      setCreating(true);

      try {
        const groupId =
          await addGroup(
            trimmedName
          );

        if (!groupId) {
          return;
        }

        const invite =
          await InviteService.createInvite(
            groupId
          );

        const inviteUrl =
          `statusapp://invite/${invite.token}`;

        console.log(
          'INVITE URL:',
          inviteUrl
        );

        await Share.share({
          message:
            `Join my group "${trimmedName}":\n${inviteUrl}`,
        });

        router.replace('/(tabs)');
      } catch (error) {
        console.error(
          'Create group error:',
          error
        );

        Alert.alert(
          'Could not create group',
          'Something went wrong.'
        );
      } finally {
        setCreating(false);
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
            style={
              styles.backText
            }
          >
            ‹ Back
          </Text>
        </Pressable>

        <Text
          style={styles.title}
        >
          Create group
        </Text>

        <TextInput
          value={name}
          onChangeText={
            setName
          }
          placeholder="Group name"
          placeholderTextColor="#77747A"
          style={styles.input}
          autoFocus
        />

        <Pressable
          style={[
            styles.createButton,
            (!name.trim() ||
              creating) &&
              styles.createButtonDisabled,
          ]}
          onPress={
            handleCreate
          }
          disabled={
            !name.trim() ||
            creating
          }
        >
          <Text
            style={
              styles.createButtonText
            }
          >
            {creating
              ? 'Creating...'
              : 'Create group'}
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
      marginBottom: 30,
    },

    input: {
      height: 58,
      borderRadius: 18,
      backgroundColor:
        '#29282D',
      color: '#F5F5F5',
      paddingHorizontal: 18,
      fontSize: 16,
    },

    createButton: {
      height: 56,
      borderRadius: 18,
      backgroundColor:
        '#4CAF50',
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 20,
    },

    createButtonDisabled: {
      backgroundColor:
        '#3A393D',
    },

    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });