import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mascota, Habitacion, ScreenProps } from '@/src/types';
import { petsService } from '@/src/services/api/pets.service';
import { roomsService } from '@/src/services/api/rooms.service';
import { reservationsService } from '@/src/services/api/reservations.service';
import { Colors } from '@/src/utils/theme';
import { styles } from './NewReservationScreen.styles';

const isWeb = Platform.OS === 'web';

export const NewReservationScreen: React.FC<ScreenProps> = ({
  navigation,
}) => {
  const [pets, setPets] = useState<Mascota[]>([]);
  const [rooms, setRooms] = useState<Habitacion[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [fechaEntrada, setFechaEntrada] = useState<Date | null>(null);
  const [fechaSalida, setFechaSalida] = useState<Date | null>(null);
  const [fechaEntradaWeb, setFechaEntradaWeb] = useState('');
  const [fechaSalidaWeb, setFechaSalidaWeb] = useState('');
  const [selectedHabitacionId, setSelectedHabitacionId] = useState<string | null>(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [esEspecial, setEsEspecial] = useState(false);
  const [serviciosAdicionales, setServiciosAdicionales] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviciosDisponibles = [
    { id: 'bano', label: 'Baño', icon: '🛁' },
    { id: 'paseo', label: 'Paseo', icon: '🚶' },
    { id: 'alimentacion especial', label: 'Alimentación especial', icon: '🍗' },
  ];

  // Load pets on mount
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoadingPets(true);
      setGeneralError(null);
      const data = await petsService.getPets();
      setPets(data as Mascota[]);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar mascotas';
      setGeneralError(errorMessage);
    } finally {
      setLoadingPets(false);
    }
  };

  // Load rooms when dates are selected
  const loadAvailableRooms = async () => {
    if (isWeb) {
      if (!fechaEntradaWeb || !fechaSalidaWeb) return;
    } else {
      if (!fechaEntrada || !fechaSalida) return;
    }

    try {
      setLoadingRooms(true);
      const fromDate = isWeb ? fechaEntradaWeb : format(fechaEntrada!, 'yyyy-MM-dd');
      const toDate = isWeb ? fechaSalidaWeb : format(fechaSalida!, 'yyyy-MM-dd');
      const data = await roomsService.getAvailableRooms(fromDate, toDate);
      setRooms(
        data.map((room) => ({
          id: room.id,
          name: room.numero,
        }))
      );
      setSelectedHabitacionId(null); // Reset room selection when dates change
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar habitaciones';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingRooms(false);
    }
  };

  const toggleServicio = (servicioId: string) => {
    setServiciosAdicionales(prev =>
      prev.includes(servicioId)
        ? prev.filter(s => s !== servicioId)
        : [...prev, servicioId]
    );
  };

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
    
    if (esEspecial && serviciosAdicionales.length === 0) {
      newErrors.servicios = 'Por favor especifica al menos un servicio adicional';
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
      // Load rooms with new dates
      setTimeout(() => {
        loadAvailableRooms();
      }, 100);
    }
  };

  const handleCheckOutDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false);
    }
    if (selectedDate) {
      setFechaSalida(selectedDate);
      // Load rooms with new dates
      setTimeout(() => {
        loadAvailableRooms();
      }, 100);
    }
  };

  const handleWebDateChange = (field: 'entrada' | 'salida', value: string) => {
    if (field === 'entrada') {
      setFechaEntradaWeb(value);
    } else {
      setFechaSalidaWeb(value);
    }
    // Load rooms when new date is set
    if ((field === 'entrada' && fechaSalidaWeb && value) || 
        (field === 'salida' && fechaEntradaWeb && value)) {
      loadAvailableRooms();
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const fromDate = isWeb ? fechaEntradaWeb : format(fechaEntrada!, 'yyyy-MM-dd');
      const toDate = isWeb ? fechaSalidaWeb : format(fechaSalida!, 'yyyy-MM-dd');

      await reservationsService.createReservation({
        mascotaId: selectedPetId!,
        habitacionId: selectedHabitacionId!,
        fechaEntrada: fromDate,
        fechaSalida: toDate,
        tipoHospedaje: esEspecial ? 'especial' : 'estandar',
        serviciosAdicionales: esEspecial ? serviciosAdicionales : undefined,
      });

      Alert.alert('Éxito', 'Reserva creada correctamente', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al crear reserva';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPets) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Nueva reserva</Text>

          {generalError && (
            <View style={{ backgroundColor: Colors.error + '20', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: Colors.error }}>{generalError}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seleccionar mascota</Text>
            {errors.mascota && (
              <Text style={styles.errorText}>
                {errors.mascota}
              </Text>
            )}
            <View style={styles.petSelector}>
              {pets.length === 0 ? (
                <Text style={styles.errorText}>No tienes mascotas registradas</Text>
              ) : (
                pets.map((mascota) => (
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
                ))
              )}
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
                  onChangeText={(val) => handleWebDateChange('entrada', val)}
                  error={errors.fechaEntrada}
                  required
                />
                <Input
                  label="Fecha de salida"
                  placeholder="2026-04-05"
                  value={fechaSalidaWeb}
                  onChangeText={(val) => handleWebDateChange('salida', val)}
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

          {datesSelected && calculateNights() > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seleccionar habitación</Text>
                {loadingRooms && <ActivityIndicator size="small" color={Colors.primary} />}
                {errors.habitacion && (
                  <Text style={styles.errorText}>{errors.habitacion}</Text>
                )}
                <View style={styles.roomSelector}>
                  {rooms.length === 0 && !loadingRooms ? (
                    <Text style={styles.errorText}>No hay habitaciones disponibles para estas fechas</Text>
                  ) : (
                    rooms.map((room) => (
                      <Pressable
                        key={room.id}
                        onPress={() => setSelectedHabitacionId(room.id)}
                        style={[
                          styles.roomOption,
                          selectedHabitacionId === room.id && styles.roomOptionSelected,
                        ]}
                        disabled={loadingRooms}
                      >
                        <Text style={styles.roomOptionText}>{room.name}</Text>
                      </Pressable>
                    ))
                  )}
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
                  <View style={styles.serviciosContainer}>
                    <Text style={styles.serviciosLabel}>Servicios adicionales</Text>
                    <View style={styles.serviciosGrid}>
                      {serviciosDisponibles.map((servicio) => (
                        <Pressable
                          key={servicio.id}
                          onPress={() => toggleServicio(servicio.id)}
                          style={[
                            styles.servicioButton,
                            serviciosAdicionales.includes(servicio.id) && styles.servicioButtonSelected,
                          ]}
                        >
                          <Text style={styles.servicioIcon}>{servicio.icon}</Text>
                          <Text style={styles.servicioLabelText}>{servicio.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
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
                      {rooms.find(h => h.id === selectedHabitacionId)?.name}
                    </Text>
                  </View>
                )}
                {esEspecial && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tipo</Text>
                    <Text style={styles.summaryValue}>Especial</Text>
                  </View>
                )}
                {esEspecial && serviciosAdicionales.length > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Servicios</Text>
                    <Text style={styles.summaryValue}>{serviciosAdicionales.join(', ')}</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={styles.actions}>
            <Button
              title={isSubmitting ? 'Creando...' : 'Crear reserva'}
              onPress={handleSubmit}
              fullWidth
              size="lg"
              disabled={isSubmitting}
            />
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="secondary"
              fullWidth
              size="lg"
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

