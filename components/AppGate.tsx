import { Redirect } from 'expo-router';
import {
    ActivityIndicator,
    View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

type AppGateProps = {
  children: React.ReactNode;
};

export function AppGate({
  children,
}: AppGateProps) {
  const {
    currentUser,
    profile,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1C1B1F',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <Redirect href="/login" />
    );
  }

  if (!profile) {
    return (
      <Redirect href="/onboarding" />
    );
  }

  return <>{children}</>;
}