import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Spacing } from '@/src/utils/theme';
import { Mascota, ScreenProps } from '@/src/types';
import { styles } from './PetsScreen.styles';

const initialPets: Mascota[] = [
  {
    id: "1",
    nombre: 'Max',
    tipo: 'perro',
    raza: 'Golden Retriever',
    anos: 3,
    meses: 6,
    sexo: 'macho',
    tamaño: 'grande',
    estadoVacunacion: 'vacunado',
    condicionesMedicas: 'Ninguna',
    numeroVeterinario: '+506 2234-5678',
    cuidadosEspeciales: 'Requiere baño mensual y cepillado frecuente',
    foto: '',
  },
  {
    id: "2",
    nombre: 'Luna',
    tipo: 'gato',
    raza: 'Persa',
    anos: 2,
    meses: 3,
    sexo: 'hembra',
    tamaño: 'pequeño',
    estadoVacunacion: 'vacunado',
    condicionesMedicas: 'Alergia a ciertos alimentos',
    numeroVeterinario: '+506 2234-5678',
    cuidadosEspeciales: 'Debe estar en interiores',
    foto: '',
  },
];

export const PetsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [pets, setPets] = useState(initialPets);

  const handleDeletePet = (petId: string, petName: string) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Estás seguro de que quieres eliminar a ${petName}?`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: () => {
            setPets((prev) => prev.filter((pet) => pet.id !== petId));
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Mis mascotas</Text>
              <Button
                title="Añadir mascota"
                onPress={() => navigation.navigate('NewPet')}
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
              onPress={() => navigation.navigate('NewPet')}
            />
          </View>
        }
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};
