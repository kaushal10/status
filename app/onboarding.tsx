import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/users/UserService';

export default function OnboardingScreen() {
  const router = useRouter();

  const {
    currentUser,
    refreshProfile,
  } = useAuth();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function continueToApp() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        'Enter your name',
        'Please enter your name to continue.'
      );
      return;
    }

    if (!currentUser) {
      Alert.alert(
        'Something went wrong',
        'We could not identify your account.'
      );
      return;
    }

    setLoading(true);

    try {
      await UserService.createUser(
        currentUser.id,
        trimmedName
      );

      await refreshProfile();

      router.replace('/(tabs)');
    } catch (error) {
      console.error(
        'Create user error:',
        error
      );

      Alert.alert(
        'Could not create profile',
        'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Welcome to Status
        </Text>

        <Text style={styles.subtitle}>
          What should we call you?
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
        />

        <Pressable
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={continueToApp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? 'Creating...'
              : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1F',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  title: {
    color: '#F5F5F5',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },

  subtitle: {
    color: '#BDB9C0',
    fontSize: 17,
    marginBottom: 28,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#29282D',
    borderRadius: 14,
    color: '#F5F5F5',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});