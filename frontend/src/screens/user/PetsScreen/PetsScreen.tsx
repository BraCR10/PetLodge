import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Spacing, Colors } from '@/src/utils/theme';
import { Mascota, ScreenProps } from '@/src/types';
import { petsService } from '@/src/services/api/pets.service';
import { styles } from './PetsScreen.styles';

export const PetsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [pets, setPets] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar mascotas';
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
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await petsService.deletePet(petId);
              setPets((prev) => prev.filter((pet) => pet.id !== petId));
              Alert.alert('Éxito', 'Mascota eliminada correctamente');
            } catch (err: any) {
              const errorMessage = err?.response?.data?.message || err?.message || 'Error al eliminar mascota';
              Alert.alert('Error', errorMessage);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getPetIcon = (tipo: string) => {
    switch (tipo) {
      case 'perro':
        return '🐕';
      case 'gato':
        return '🐈';
      case 'conejo':
        return '🐰';
      case 'pajaro':
        return '🐦';
      default:
        return '🐾';
    }
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
                <Text style={styles.petIcon}>{getPetIcon(item.tipo)}</Text>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.nombre}</Text>
                  <Text style={styles.petDetails}>
                    {item.raza} • {item.anos} años y {item.meses} meses
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
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};
