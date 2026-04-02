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
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mascota, Habitacion, ScreenProps } from '@/src/types';
import { styles } from './NewReservationScreen.styles';

const isWeb = Platform.OS === 'web';

const opcionesMascotas: Mascota[] = [
  { 
    id: 1, 
    nombre: 'Max', 
    tipo: 'perro', 
    raza: 'Golden Retriever', 
    edad: 3,
    sexo: 'macho',
    tamaño: 'grande',
    estadoVacunacion: 'vacunado',
    condicionesMedicas: 'Ninguna',
    numeroVeterinario: '+506 2234-5678',
    cuidadosEspeciales: 'Requiere baño mensual y cepillado frecuente',
  },
  { 
    id: 2, 
    nombre: 'Luna', 
    tipo: 'gato', 
    raza: 'Persa', 
    edad: 2,
    sexo: 'hembra',
    tamaño: 'pequeño',
    estadoVacunacion: 'vacunado',
    condicionesMedicas: 'Alergia a ciertos alimentos',
    numeroVeterinario: '+506 2234-5678',
    cuidadosEspeciales: 'Debe estar en interiores',
  },
];

const habitaciones: Habitacion[] = [
  { id: 1, name: 'Habitación Estándar A' },
  { id: 2, name: 'Habitación Estándar B' },
  { id: 3, name: 'Habitación Premium' },
  { id: 4, name: 'Suite Deluxe' },
];

export const NewReservationScreen: React.FC<ScreenProps> = ({
  navigation,
}) => {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [fechaEntrada, setFechaEntrada] = useState<Date | null>(null);
  const [fechaSalida, setFechaSalida] = useState<Date | null>(null);
  const [fechaEntradaWeb, setFechaEntradaWeb] = useState('');
  const [fechaSalidaWeb, setFechaSalidaWeb] = useState('');
  const [selectedHabitacionId, setSelectedHabitacionId] = useState<number | null>(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [esEspecial, setEsEspecial] = useState(false);
  const [serviciosAdicionales, setServiciosAdicionales] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if dates are selected to enable room selection
  const datesSelected = isWeb ? (fechaEntradaWeb && fechaSalidaWeb) : (fechaEntrada && fechaSalida);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedPetId) newErrors.mascota = 'Por favor selecciona una mascota';
    
    if (isWeb) {
      if (!fechaEntradaWeb) newErrors.fechaEntrada = 'La fecha de entrada es requerida';
      if (!fechaSalidaWeb) newErrors.fechaSalida = 'La fecha de salida es requerida';
      else if (fechaEntradaWeb && fechaSalidaWeb && fechaSalidaWeb <= fechaEntradaWeb) {
        newErrors.fechaSalida = 'La salida debe ser después de la entrada';
      }
    } else {
      if (!fechaEntrada) newErrors.fechaEntrada = 'La fecha de entrada es requerida';
      if (!fechaSalida) newErrors.fechaSalida = 'La fecha de salida es requerida';
      else if (fechaEntrada && fechaSalida && fechaSalida <= fechaEntrada) {
        newErrors.fechaSalida = 'La salida debe ser después de la entrada';
      }
    }

    if (!selectedHabitacionId) newErrors.habitacion = 'Por favor selecciona una habitación';
    
    if (esEspecial && !serviciosAdicionales) {
      newErrors.servicios = 'Por favor especifica los servicios solicitados';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckInDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCheckInPicker(false);
    }
    if (selectedDate) {
      setFechaEntrada(selectedDate);
    }
  };

  const handleCheckOutDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false);
    }
    if (selectedDate) {
      setFechaSalida(selectedDate);
    }
  };

  const calculateNights = () => {
    if (isWeb) {
      if (!fechaEntradaWeb || !fechaSalidaWeb) return 0;
      const checkIn = new Date(fechaEntradaWeb);
      const checkOut = new Date(fechaSalidaWeb);
      return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      if (!fechaEntrada || !fechaSalida) return 0;
      return Math.ceil((fechaSalida.getTime() - fechaEntrada.getTime()) / (1000 * 60 * 60 * 24));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const reservationType = esEspecial ? 'especial' : 'estándar';
    Alert.alert('Éxito', `La reserva ${reservationType} se ha creado en este demo.`, [
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
            {isWeb ? (
              <>
                <Input
                  label="Fecha de entrada"
                  placeholder="2026-04-01"
                  value={fechaEntradaWeb}
                  onChangeText={setFechaEntradaWeb}
                  error={errors.fechaEntrada}
                  required
                />
                <Input
                  label="Fecha de salida"
                  placeholder="2026-04-05"
                  value={fechaSalidaWeb}
                  onChangeText={setFechaSalidaWeb}
                  error={errors.fechaSalida}
                  required
                />
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => setShowCheckInPicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonLabel}>Fecha de entrada</Text>
                  <Text style={styles.dateButtonValue}>
                    {fechaEntrada ? format(fechaEntrada, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                  </Text>
                </Pressable>
                {errors.fechaEntrada && (
                  <Text style={styles.errorText}>{errors.fechaEntrada}</Text>
                )}

                {showCheckInPicker && (
                  <DateTimePicker
                    value={fechaEntrada || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleCheckInDateChange}
                  />
                )}

                <Pressable
                  onPress={() => setShowCheckOutPicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonLabel}>Fecha de salida</Text>
                  <Text style={styles.dateButtonValue}>
                    {fechaSalida ? format(fechaSalida, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                  </Text>
                </Pressable>
                {errors.fechaSalida && (
                  <Text style={styles.errorText}>{errors.fechaSalida}</Text>
                )}

                {showCheckOutPicker && (
                  <DateTimePicker
                    value={fechaSalida || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleCheckOutDateChange}
                  />
                )}
              </>
            )}
          </View>

          {((isWeb && fechaEntradaWeb && fechaSalidaWeb) || (!isWeb && fechaEntrada && fechaSalida)) && calculateNights() > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seleccionar habitación</Text>
                {errors.habitacion && (
                  <Text style={styles.errorText}>{errors.habitacion}</Text>
                )}
                <View style={styles.roomSelector}>
                  {habitaciones.map((room) => (
                    <Pressable
                      key={room.id}
                      onPress={() => setSelectedHabitacionId(room.id)}
                      style={[
                        styles.roomOption,
                        selectedHabitacionId === room.id && styles.roomOptionSelected,
                      ]}
                    >
                      <Text style={styles.roomOptionText}>{room.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipo de reserva</Text>
                <Pressable
                  onPress={() => setEsEspecial(!esEspecial)}
                  style={styles.checkboxContainer}
                >
                  <View style={[styles.checkbox, esEspecial && styles.checkboxChecked]}>
                    {esEspecial && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Reserva especial con servicios adicionales</Text>
                </Pressable>

                {esEspecial && (
                  <Input
                    label="Servicios solicitados"
                    placeholder="p. ej., Paseo diario, baño especial, alimentación personalizada"
                    value={serviciosAdicionales}
                    onChangeText={setServiciosAdicionales}
                    error={errors.servicios}
                    multiline
                    numberOfLines={3}
                    required
                  />
                )}
              </View>

              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Entrada</Text>
                  <Text style={styles.summaryValue}>
                    {isWeb ? fechaEntradaWeb : format(fechaEntrada!, 'dd/MM/yyyy')}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Salida</Text>
                  <Text style={styles.summaryValue}>
                    {isWeb ? fechaSalidaWeb : format(fechaSalida!, 'dd/MM/yyyy')}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Número de noches</Text>
                  <Text style={styles.summaryValue}>{calculateNights()}</Text>
                </View>
                {selectedHabitacionId && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Habitación</Text>
                    <Text style={styles.summaryValue}>
                      {habitaciones.find(h => h.id === selectedHabitacionId)?.name}
                    </Text>
                  </View>
                )}
                {esEspecial && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tipo</Text>
                    <Text style={styles.summaryValue}>Especial</Text>
                  </View>
                )}
              </View>
            </>
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
