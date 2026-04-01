import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mascota, ScreenProps } from '@/src/types';
import { styles } from './NewReservationScreen.styles';

const opcionesMascotas: Mascota[] = [
  { id: 'pet-1', nombre: 'Max', tipo: 'perro', raza: 'Golden Retriever', edad: 3 },
  { id: 'pet-2', nombre: 'Luna', tipo: 'gato', raza: 'Persa', edad: 2 },
];

export const NewReservationScreen: React.FC<ScreenProps> = ({
  navigation,
}) => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedPetId) newErrors.mascota = 'Por favor selecciona una mascota';
    if (!fechaEntrada) newErrors.fechaEntrada = 'La fecha de entrada es requerida';
    if (!fechaSalida) newErrors.fechaSalida = 'La fecha de salida es requerida';
    else if (fechaSalida <= fechaEntrada) newErrors.fechaSalida = 'La salida debe ser después de la entrada';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNights = () => {
    if (!fechaEntrada || !fechaSalida) return 0;
    const checkInDate = new Date(fechaEntrada);
    const checkOutDate = new Date(fechaSalida);
    return Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert('Éxito', 'La reserva se ha creado en este demo.', [
      { text: 'Aceptar', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Nueva reserva</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seleccionar mascota</Text>
            {errors.mascota && (
              <Text style={styles.errorText}>
                {errors.mascota}
              </Text>
            )}
            <View style={styles.petSelector}>
              {opcionesMascotas.map((mascota) => (
                <Pressable
                  key={mascota.id}
                  onPress={() => setSelectedPetId(mascota.id)}
                  style={[
                    styles.petOption,
                    selectedPetId === mascota.id && styles.petOptionSelected,
                  ]}
                >
                  <Text style={styles.petOptionText}>
                    {mascota.nombre} • {mascota.raza}
                  </Text>
                  <Text style={styles.petOptionIcon}>
                    {mascota.tipo === 'perro' ? '🐕' : mascota.tipo === 'gato' ? '🐈' : '🐾'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entrada y salida</Text>
            <Input
              label="Fecha de entrada (AAAA-MM-DD)"
              placeholder="2026-04-01"
              value={fechaEntrada}
              onChangeText={setFechaEntrada}
              error={errors.fechaEntrada}
              required
            />
            <Input
              label="Fecha de salida (AAAA-MM-DD)"
              placeholder="2026-04-05"
              value={fechaSalida}
              onChangeText={setFechaSalida}
              error={errors.fechaSalida}
              required
            />
          </View>

          {fechaEntrada && fechaSalida && calculateNights() > 0 && (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Entrada</Text>
                <Text style={styles.summaryValue}>{fechaEntrada}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Salida</Text>
                <Text style={styles.summaryValue}>{fechaSalida}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Número de noches</Text>
                <Text style={styles.summaryValue}>{calculateNights()}</Text>
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title="Crear reserva"
              onPress={handleSubmit}
              fullWidth
              size="lg"
            />
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="secondary"
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
