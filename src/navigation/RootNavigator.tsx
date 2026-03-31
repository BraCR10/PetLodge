import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '@/src/context/AuthContext';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user } = useAuth();

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
