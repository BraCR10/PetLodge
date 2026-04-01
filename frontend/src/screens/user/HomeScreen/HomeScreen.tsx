import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Spacing } from '@/src/utils/theme';
import { ScreenProps } from '@/src/types';
import { styles } from './HomeScreen.styles';

export const HomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const user = { name: 'Guest User' };

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
    navigation.getParent()?.getParent()?.replace('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>🐾</Text>
          <Text style={styles.welcomeText}>¡Hola, {user?.name}!</Text>
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
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Mascotas</Text>
              </View>
            </Card>
            <Card padding={Spacing.md}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Reservas</Text>
              </View>
            </Card>
          </View>
        </View>

        <Button
          title="Cerrar sesión"
          onPress={handleLogout}
          variant="secondary"
          fullWidth
          size="lg"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
