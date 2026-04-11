import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Toast } from '@/src/components/ui/Toast';
import { useToast } from '@/src/hooks/useToast';
import { Spacing } from '@/src/utils/theme';
import { ScreenProps } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { styles } from './AdminHomeScreen.styles';

export const AdminHomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const { toast, showToast } = useToast();

  const modules = [
    {
      id: 'users',
      title: 'Gestión de usuarios',
      icon: '👥',
      color: '#FFE5B4',
    },
    {
      id: 'management',
      title: 'Módulo de Gestión',
      icon: '📊',
      color: '#B4E5FF',
    },
    {
      id: 'notifications',
      title: 'Centro de Notificaciones',
      icon: '🔔',
      color: '#E5D4FF',
    },
    {
      id: 'register-admin',
      title: 'Registrar nuevo administrador',
      icon: '➕',
      color: '#D4FFE5',
    },
  ];

  const handleModulePress = (moduleId: string, moduleName: string) => {
    if (moduleId === 'notifications') {
      navigation.navigate('NotificationCenter');
    } else {
      showToast(
        `${moduleName} próximamente disponible`,
        'success'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={{ fontSize: 16 }}>🛡️</Text>
            <Text style={styles.badgeText}>MODO ADMINISTRADOR</Text>
          </View>
          <Text style={styles.welcomeText}>Panel de Control</Text>
          <Text style={styles.subtitle}>Gestiona tu plataforma PetLodge</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          {modules.map((module) => (
            <Pressable
              key={module.id}
              onPress={() => handleModulePress(module.id, module.title)}
              style={({ pressed }) => [
                styles.moduleCard,
                { backgroundColor: module.color, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumen del Sistema</Text>
          <View style={styles.statsContainer}>
            <Card padding={Spacing.md}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Usuarios</Text>
              </View>
            </Card>
            <Card padding={Spacing.md}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Reservas</Text>
              </View>
            </Card>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cerrar sesión"
            onPress={handleLogout}
            variant="destructive"
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
