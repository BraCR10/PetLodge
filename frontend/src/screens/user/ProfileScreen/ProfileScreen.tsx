import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Spacing } from '@/src/utils/theme';
import { ScreenProps } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { styles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { user, setUser } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>No hay usuario autenticado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Cerrar sesión',
        onPress: () => {
          setUser(null);
          navigation.getParent()?.getParent()?.replace('Auth');
        },
        style: 'destructive',
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi perfil</Text>
          <Button
            title="Editar"
            onPress={() => navigation.navigate('EditProfile', { user })}
            size="sm"
            style={styles.editButton}
          />
        </View>

        <Card padding={Spacing.lg} margin={0}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.nombre)}</Text>
            </View>
            <Text style={styles.name}>{user.nombre}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </Card>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <Card padding={Spacing.md} margin={0}>
            <View style={styles.infoRows}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                <Text style={styles.infoValue}>{user.nombre}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Número de identificación</Text>
                <Text style={styles.infoValue}>{user.numeroIdentificacion}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Correo electrónico</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              {!user.isAdmin && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Número de teléfono</Text>
                    <Text style={styles.infoValue}>{user.numeroTelefono}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue}>{user.direccion}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Miembro desde</Text>
                    <Text style={styles.infoValue}>
                      {new Date(user.fechaRegistro).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </Card>
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
