import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { Group } from '../types';

type Props = {
  group: Group;
  onPress: () => void;
};

export default function GroupCard({
  group,
  onPress,
}: Props) {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      <Text style={styles.name}>
        {group.name}
      </Text>

      <Text style={styles.members}>
        {group.memberIds.length}{' '}
        {group.memberIds.length === 1
          ? 'member'
          : 'members'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#29282D',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  name: {
    color: '#F5F5F5',
    fontSize: 17,
    fontWeight: '600',
  },

  members: {
    color: '#AAA7AE',
    fontSize: 13,
    marginTop: 6,
  },
});