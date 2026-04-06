import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/utils/theme';

// Loading screen shown while checking for persisted token
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

export const RootNavigator = () => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        user.isAdmin ? <AdminNavigator /> : <UserNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
