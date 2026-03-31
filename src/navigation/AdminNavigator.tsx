import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminHomeScreen } from '@/src/screens/admin/AdminHomeScreen/AdminHomeScreen';
import { NotificationCenterScreen } from '@/src/screens/admin/NotificationCenterScreen/NotificationCenterScreen';
import { Colors, Typography } from '@/src/utils/theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: Colors.primary,
  },
  headerTintColor: Colors.background,
  headerTitleStyle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600' as const,
  },
};

export const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: 'Panel Administrativo' }}
      />
      <Stack.Screen
        name="NotificationCenter"
        component={NotificationCenterScreen}
        options={{ title: 'Centro de Notificaciones' }}
      />
    </Stack.Navigator>
  );
};
