import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/src/screens/user/HomeScreen/HomeScreen';
import { PetsScreen } from '@/src/screens/user/PetsScreen/PetsScreen';
import { EditPetScreen } from '@/src/screens/user/EditPetScreen/EditPetScreen';
import { ReservationsScreen } from '@/src/screens/user/ReservationsScreen/ReservationsScreen';
import { NewReservationScreen } from '@/src/screens/user/NewReservationScreen/NewReservationScreen';
import { ReservationDetailScreen } from '@/src/screens/user/ReservationDetailScreen/ReservationDetailScreen';
import { ProfileScreen } from '@/src/screens/user/ProfileScreen/ProfileScreen';
import { EditProfileScreen } from '@/src/screens/user/EditProfileScreen/EditProfileScreen';
import { Colors, Typography } from '@/src/utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
    </Stack.Navigator>
  );
};

const PetsStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PetsScreen"
        component={PetsScreen}
        options={{ title: 'Mis mascotas' }}
      />
      <Stack.Screen
        name="EditPet"
        component={EditPetScreen}
        options={{ title: 'Editar mascota' }}
      />
      <Stack.Screen
        name="NewPet"
        component={EditPetScreen}
        options={{ title: 'Añadir mascota' }}
      />
    </Stack.Navigator>
  );
};

const ReservationsStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ReservationsScreen"
        component={ReservationsScreen}
        options={{ title: 'Reservas' }}
      />
      <Stack.Screen
        name="NewReservation"
        component={NewReservationScreen}
        options={{ title: 'Nueva reserva' }}
      />
      <Stack.Screen
        name="ReservationDetail"
        component={ReservationDetailScreen}
        options={{ title: 'Detalles de la reserva' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Mi perfil' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Editar perfil' }}
      />
    </Stack.Navigator>
  );
};

export const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Pets"
        component={PetsStack}
        options={{
          title: 'Mascotas',
          tabBarLabel: 'Mascotas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🐕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationsStack}
        options={{
          title: 'Reservas',
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>📅</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
