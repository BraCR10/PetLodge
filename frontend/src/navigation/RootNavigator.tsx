import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '@/src/context/AuthContext';
import { Colors } from '@/src/utils/theme';

const Stack = createNativeStackNavigator();

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
      <Stack.Navigator
        initialRouteName={user ? (user.isAdmin ? 'Admin' : 'User') : 'Auth'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="User"
          component={UserNavigator}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminNavigator}
          options={{ animation: 'none' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
