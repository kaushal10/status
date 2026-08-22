import { Ionicons } from '@expo/vector-icons';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Friend } from '../types';

type Props = {
  friend: Friend;
  onRemove?: () => void;
};

export default function MemberCard({
  friend,
  onRemove,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>
          {friend.name}
        </Text>

        <View
          style={styles.statusRow}
        >
          <View
            style={[
              styles.statusDot,
              friend.available
                ? styles.available
                : styles.unavailable,
            ]}
          />

          <Text
            style={styles.statusText}
          >
            {friend.available
              ? 'AVAILABLE'
              : 'UNAVAILABLE'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={10}
        style={
          styles.trashButton
        }
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#AAA7AE"
        />
      </Pressable>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      minHeight: 68,
      borderRadius: 18,
      backgroundColor:
        '#29282D',
      marginBottom: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    info: {
      flex: 1,
    },

    name: {
      color: '#F5F5F5',
      fontSize: 16,
      fontWeight: '600',
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 7,
    },

    available: {
      backgroundColor:
        '#4CAF50',
    },

    unavailable: {
      backgroundColor:
        '#77747A',
    },

    statusText: {
      color: '#AAA7AE',
      fontSize: 11,
      fontWeight: '600',
    },

    trashButton: {
      padding: 8,
      marginLeft: 10,
    },
  });