import {
    router,
    useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useGroups } from '../../../context/GroupContext';

export default function AddMemberScreen() {
  const { id } =
    useLocalSearchParams<{ id: string }>();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const { addMember } = useGroups();

  const handleAdd = () => {
    setError('');

    const normalizedPhone = phone.replace(
      /\D/g,
      ''
    );

    if (!normalizedPhone) {
      setError('Enter a phone number');
      return;
    }

    const added = addMember(
      id,
      normalizedPhone
    );

    if (!added) {
      setError(
        'User not found or already in this group'
      );
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹ Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Add member
        </Text>

        <Text style={styles.subtitle}>
          Enter their phone number
        </Text>

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor="#77747A"
          keyboardType="phone-pad"
          style={styles.input}
          autoFocus
        />

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          style={styles.addButton}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>
            Add member
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
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
  },

  subtitle: {
    color: '#AAA7AE',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
  },

  input: {
    height: 58,
    borderRadius: 18,
    backgroundColor: '#29282D',
    color: '#F5F5F5',
    paddingHorizontal: 18,
    fontSize: 17,
  },

  error: {
    color: '#EF9A9A',
    fontSize: 14,
    marginTop: 12,
  },

  addButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});