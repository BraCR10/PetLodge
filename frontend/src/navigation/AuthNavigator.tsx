import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/src/screens/auth/LoginScreen/LoginScreen';
import { RegisterScreen } from '@/src/screens/auth/RegisterScreen/RegisterScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: 'default',
        }}
      />
    </Stack.Navigator>
  );
};
