import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/src/components/ui/Button';
import { Toast } from '@/src/components/ui/Toast';
import { Card } from '@/src/components/ui/Card';
import { Spacing, Colors } from '@/src/utils/theme';
import { useToast } from '@/src/hooks/useToast';
import { Mascota, ScreenProps } from '@/src/types';
import { petsService } from '@/src/services/api/pets.service';
import { styles } from './PetsScreen.styles';
import { getFriendlyErrorMessage } from '@/src/utils/errors';

export const PetsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [pets, setPets] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const isSupabaseUrl = (url: string) => {
    return url.includes('supabase.co') || url.includes('.storage');
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (nombre: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    const index = nombre.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petsService.getPets();
      setPets(
        data.map((pet) => ({
          ...pet,
          foto: pet.foto || '',
        }))
      );
    } catch (err: any) {
      const errorMessage = getFriendlyErrorMessage(err, 'Error al cargar mascotas');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  // Refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadPets();
    }, [])
  );

  const handleDeletePet = (petId: string, petName: string) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Estás seguro de que quieres eliminar a ${petName}?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await petsService.deletePet(petId);
              setPets((prev) => prev.filter((pet) => pet.id !== petId));
              showToast('Mascota eliminada', 'success');
            } catch (err: any) {
              const errorMessage = getFriendlyErrorMessage(err, 'Hubo un error eliminando la mascota, vuelva a intentar');
              showToast(errorMessage, 'error');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <Text style={styles.emptyText}>{error}</Text>
          <Button
            title="Reintentar"
            onPress={loadPets}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={deleting} transparent animationType="none">
        <View style={{ flex: 1 }} />
      </Modal>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Mis mascotas</Text>
              <Button
                title="Añadir mascota"
                onPress={() => navigation.navigate('EditPet')}
                size="sm"
                style={styles.addButton}
              />
            </View>
          </View>
        }
        data={pets}
        renderItem={({ item }) => (
          <View style={[styles.content, styles.contentNoVerticalPadding]}>
            <Card padding={Spacing.md} margin={0}>
              <View style={styles.petContent}>
                {item.foto && isSupabaseUrl(item.foto) ? (
                  <Image
                    source={{ uri: item.foto }}
                    style={styles.petImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.petImage,
                      {
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: getBackgroundColor(item.nombre),
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
                      {getInitials(item.nombre)}
                    </Text>
                  </View>
                )}
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.nombre}</Text>
                  <Text style={styles.petDetails}>
                    {item.raza} • {item.años} años y {item.meses} meses
                  </Text>
                </View>
              </View>
              <View style={styles.petActions}>
                <Button
                  title="Editar"
                  onPress={() =>
                    navigation.navigate('EditPet', { pet: item })
                  }
                  variant="secondary"
                  size="sm"
                  style={styles.actionButton}
                />
                <Button
                  title="Eliminar"
                  onPress={() => handleDeletePet(item.id, item.nombre)}
                  variant="destructive"
                  size="sm"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyText}>Aún no has añadido mascotas</Text>
            <Button
              title="Añade tu primera mascota"
              onPress={() => navigation.navigate('EditPet')}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};
