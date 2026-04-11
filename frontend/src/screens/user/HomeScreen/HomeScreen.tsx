import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Spacing } from '@/src/utils/theme';
import { ScreenProps } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { petsService } from '@/src/services/api/pets.service';
import { reservationsService } from '@/src/services/api/reservations.service';
import { styles } from './HomeScreen.styles';

export const HomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [petsCount, setPetsCount] = useState(0);
  const [reservationsCount, setReservationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchCounts = async () => {
        try {
          const [pets, reservations] = await Promise.all([
            petsService.getPets(),
            reservationsService.getReservations(),
          ]);
          setPetsCount(pets.length);
          setReservationsCount(reservations.length);
        } catch (error) {
          console.error('Error fetching counts:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCounts();
    }, [])
  );

  const quickActions = [
    {
      id: 'pets',
      title: 'Mis mascotas',
      icon: '🐕',
      screen: 'Pets',
      color: '#FFE5B4',
    },
    {
      id: 'reservations',
      title: 'Reservas',
      icon: '📅',
      screen: 'Reservations',
      color: '#B4E5FF',
    },
    {
      id: 'profile',
      title: 'Mi perfil',
      icon: '👤',
      screen: 'Profile',
      color: '#E5D4FF',
    },
  ];

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>🐾</Text>
          <Text style={styles.welcomeText}>¡Hola, {user?.nombre}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => navigation.navigate(action.screen)}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: action.color, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.statsContainer}>
            <Card padding={Spacing.md}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{petsCount}</Text>
                <Text style={styles.statLabel}>Mascotas</Text>
              </View>
            </Card>
            <Card padding={Spacing.md}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{reservationsCount}</Text>
                <Text style={styles.statLabel}>Reservas</Text>
              </View>
            </Card>
          </View>
        </View>

        <Button
          title="Cerrar sesión"
          onPress={handleLogout}
          variant="destructive"
          fullWidth
          size="lg"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
