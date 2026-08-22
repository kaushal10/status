import { router } from 'expo-router';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import MemberCard from '../../components/MemberCard';
import StatusToggle from '../../components/StatusToggle';

import {
  useFriends,
} from '../../context/FriendContext';

export default function HomeScreen() {
  const {
    friends,
    currentUser,
    loading,
    removeFriend,
  } = useFriends();

  if (loading) {
    return (
      <ScrollView
        contentContainerStyle={
          styles.center
        }
      >
        <Text
          style={styles.loading}
        >
          Loading...
        </Text>
      </ScrollView>
    );
  }

  if (!currentUser) {
    return (
      <ScrollView
        contentContainerStyle={
          styles.center
        }
      >
        <Text
          style={styles.error}
        >
          User not found
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={
        styles.content
      }
    >
      <Text
        style={styles.greeting}
      >
        Hello, {currentUser.name}
      </Text>

      <Text
        style={styles.subtitle}
      >
        Let your friends know when you're free
      </Text>

      <StatusToggle />

      <Text
        style={styles.sectionTitle}
      >
        Friends
      </Text>

      <Pressable
        onPress={() =>
          router.push(
            '/add-friend'
          )
        }
        style={
          styles.addFriendButton
        }
      >
        <Text
          style={styles.addFriend}
        >
          + Add friend
        </Text>
      </Pressable>

      {friends.length === 0 ? (
        <Text
          style={styles.emptyText}
        >
          No friends yet.
        </Text>
      ) : (
        friends.map(
          (friend) => (
            <MemberCard
              key={friend.id}
              friend={friend}
              onRemove={() =>
                removeFriend(
                  friend.id
                )
              }
            />
          )
        )
      )}

      {/* Temporary development button.
          Remove this entire section
          after two-user testing. */}
      <Pressable
        onPress={() =>
          router.push(
            '/test-users'
          )
        }
        style={
          styles.testButton
        }
      >
        <Text
          style={
            styles.testButtonText
          }
        >
          Developer: Test users
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    content: {
      padding: 24,
      paddingTop: 40,
      paddingBottom: 40,
      backgroundColor:
        '#1C1B1F',
      flexGrow: 1,
    },

    center: {
      flexGrow: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#1C1B1F',
    },

    loading: {
      color: '#F5F5F5',
      fontSize: 16,
    },

    error: {
      color: '#F5F5F5',
      fontSize: 18,
    },

    greeting: {
      color: '#F5F5F5',
      fontSize: 30,
      fontWeight: '700',
    },

    subtitle: {
      color: '#AAA7AE',
      fontSize: 15,
      marginTop: 8,
      marginBottom: 30,
    },

    sectionTitle: {
      color: '#F5F5F5',
      fontSize: 21,
      fontWeight: '600',
      marginTop: 42,
      marginBottom: 14,
    },

    addFriendButton: {
      height: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        '#4A484D',
      alignItems: 'center',
      justifyContent:
        'center',
      marginBottom: 18,
    },

    addFriend: {
      color: '#A5D6A7',
      fontSize: 15,
      fontWeight: '600',
    },

    emptyText: {
      color: '#AAA7AE',
      fontSize: 15,
      marginTop: 5,
    },

    testButton: {
      marginTop: 35,
      alignItems: 'center',
    },

    testButtonText: {
      color: '#77747A',
      fontSize: 12,
    },
  });