import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../libs/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMagicLink() {
    if (!email.trim()) {
      Alert.alert(
        'Enter email',
        'Please enter your email address.'
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: 'statusapp://login',
        },
      });

    setLoading(false);

    if (error) {
      console.error(
        'Send magic link error:',
        error
      );

      Alert.alert(
        'Error',
        error.message
      );

      return;
    }

    setSent(true);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Status App
        </Text>

        {!sent ? (
          <>
            <Text style={styles.label}>
              Enter your email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Pressable
              style={styles.button}
              onPress={sendMagicLink}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? 'Sending...'
                  : 'Send sign-in link'}
              </Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>
              Check your email
            </Text>

            <Text style={styles.message}>
              We sent a sign-in link to:
            </Text>

            <Text style={styles.email}>
              {email}
            </Text>

            <Text style={styles.message}>
              Tap the link in the email to
              continue.
            </Text>

            <Pressable
              onPress={() => setSent(false)}
            >
              <Text style={styles.changeEmail}>
                Use a different email
              </Text>
            </Pressable>
          </View>
        )}
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  title: {
    color: '#F5F5F5',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 48,
    textAlign: 'center',
  },

  label: {
    color: '#D0CDD2',
    fontSize: 16,
    marginBottom: 10,
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

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  messageContainer: {
    alignItems: 'center',
  },

  messageTitle: {
    color: '#F5F5F5',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },

  message: {
    color: '#BDB9C0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },

  email: {
    color: '#F5F5F5',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
  },

  changeEmail: {
    color: '#9E9E9E',
    fontSize: 15,
    marginTop: 24,
  },
});