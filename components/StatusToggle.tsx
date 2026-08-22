import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFriends } from '../context/FriendContext';

export default function StatusToggle() {
  const {
    currentUser,
    updateUserStatus,
    loading,
  } = useFriends();

  if (loading || !currentUser) {
    return null;
  }

  const available =
    currentUser.available;

  const toggleStatus = () => {
    updateUserStatus(
      currentUser.id,
      !available
    );
  };

  return (
    <View
      style={styles.statusCard}
    >
      <Pressable
        style={[
          styles.toggle,
          available &&
            styles.toggleAvailable,
        ]}
        onPress={toggleStatus}
      >
        <View
          style={[
            styles.toggleThumb,
            available &&
              styles.toggleThumbAvailable,
          ]}
        />
      </Pressable>

      <Text
        style={styles.statusText}
      >
        {available
          ? 'AVAILABLE'
          : 'UNAVAILABLE'}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    statusCard: {
      height: 180,
      borderRadius: 32,
      backgroundColor:
        '#29282D',
      marginTop: 40,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    toggle: {
      width: 120,
      height: 64,
      borderRadius: 32,
      backgroundColor:
        '#4A484D',
      justifyContent:
        'center',
      padding: 5,
    },

    toggleAvailable: {
      backgroundColor:
        '#4CAF50',
    },

    toggleThumb: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor:
        '#BDB9C0',
    },

    toggleThumbAvailable: {
      backgroundColor:
        '#FFFFFF',
      alignSelf: 'flex-end',
    },

    statusText: {
      color: '#F5F5F5',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 1,
      marginTop: 16,
    },
  });