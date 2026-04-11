import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays } from 'date-fns';
import { Button } from '@/src/components/ui/Button';
import { Toast } from '@/src/components/ui/Toast';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/hooks/useToast';
import { Mascota, ScreenProps } from '@/src/types';
import { petsService } from '@/src/services/api/pets.service';
import { roomsService } from '@/src/services/api/rooms.service';
import { reservationsService } from '@/src/services/api/reservations.service';
import { Colors, Spacing } from '@/src/utils/theme';
import { styles } from './NewReservationScreen.styles';

const isWeb = Platform.OS === 'web';

const PET_AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#A78BFA'];

const getPetInitials = (nombre: string) =>
  nombre.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const getPetAvatarColor = (nombre: string) =>
  PET_AVATAR_COLORS[nombre.charCodeAt(0) % PET_AVATAR_COLORS.length];

const getPetTypeLabel = (tipo: string): string => {
  switch (tipo.toLowerCase()) {
    case 'perro': return 'Perro';
    case 'gato': return 'Gato';
    case 'conejo': return 'Conejo';
    case 'pajaro': return 'Pájaro';
    default: return tipo;
  }
};

export const NewReservationScreen: React.FC<ScreenProps> = ({
  navigation,
}) => {
  const [pets, setPets] = useState<Mascota[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: string; name: string; disponible?: boolean }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast, showToast } = useToast();

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
  const [roomsSearched, setRoomsSearched] = useState(false);

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

  // Load rooms when dates are selected. page=1 replaces list; page>1 appends (load more).
  const loadAvailableRooms = async (page: number = 1) => {
    if (isWeb) {
      if (!fechaEntradaWeb || !fechaSalidaWeb) return;
    } else {
      if (!fechaEntrada || !fechaSalida) return;
    }

    try {
      setLoadingRooms(true);
      const fromDate = isWeb ? fechaEntradaWeb : format(fechaEntrada!, 'yyyy-MM-dd');
      const toDate = isWeb ? fechaSalidaWeb : format(fechaSalida!, 'yyyy-MM-dd');
      const response = await roomsService.getRooms(page, fromDate, toDate);
      const newRooms = response.data.map((room) => ({
        id: room.id,
        name: room.numero,
        disponible: room.disponible,
      }));

      if (page === 1) {
        setRooms(newRooms);
        setSelectedHabitacionId(null);
      } else {
        setRooms((prev) => [...prev, ...newRooms]);
      }

      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setRoomsSearched(true);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar habitaciones';
      showToast(errorMessage, 'error');
      setRoomsSearched(true);
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!selectedPetId) newErrors.mascota = 'Por favor selecciona una mascota';

    if (isWeb) {
      const todayStr = format(today, 'yyyy-MM-dd');
      if (!fechaEntradaWeb) newErrors.fechaEntrada = 'La fecha de entrada es requerida';
      else if (fechaEntradaWeb < todayStr) newErrors.fechaEntrada = 'La fecha de entrada no puede ser en el pasado';
      if (!fechaSalidaWeb) newErrors.fechaSalida = 'La fecha de salida es requerida';
      else if (fechaSalidaWeb < todayStr) newErrors.fechaSalida = 'La fecha de salida no puede ser en el pasado';
      else if (fechaEntradaWeb && fechaSalidaWeb <= fechaEntradaWeb) {
        newErrors.fechaSalida = 'La salida debe ser después de la entrada';
      }
    } else {
      if (!fechaEntrada) newErrors.fechaEntrada = 'La fecha de entrada es requerida';
      else if (fechaEntrada < today) newErrors.fechaEntrada = 'La fecha de entrada no puede ser en el pasado';
      if (!fechaSalida) newErrors.fechaSalida = 'La fecha de salida es requerida';
      else if (fechaEntrada && fechaSalida <= fechaEntrada) {
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
      setRoomsSearched(false); // Reset search flag when dates change
    }
  };

  const handleCheckOutDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false);
    }
    if (selectedDate) {
      setFechaSalida(selectedDate);
      setRoomsSearched(false); // Reset search flag when dates change
    }
  };

  const handleWebDateChange = (field: 'entrada' | 'salida', value: string) => {
    if (field === 'entrada') {
      setFechaEntradaWeb(value);
    } else {
      setFechaSalidaWeb(value);
    }
    setRoomsSearched(false); // Reset search flag when dates change
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

      showToast('Reserva creada', 'success', () => {
        setIsSubmitting(false);
        navigation.goBack();
      }, 800);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Hubo un error creando la reserva, vuelva a intentar';
      showToast(errorMessage, 'error');
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
      <Modal visible={isSubmitting} transparent animationType="none">
        <View style={{ flex: 1 }} />
      </Modal>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Nueva reserva</Text>
          <Text style={styles.requiredNote}>* Campos obligatorios</Text>

          {generalError && (
            <View style={{ backgroundColor: Colors.error + '20', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: Colors.error }}>{generalError}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Seleccionar mascota<Text style={styles.required}> *</Text>
            </Text>
            {errors.mascota && (
              <Text style={styles.errorText}>
                {errors.mascota}
              </Text>
            )}
            <View style={styles.petGrid}>
              {pets.length === 0 ? (
                <Text style={styles.errorText}>No tienes mascotas registradas</Text>
              ) : (
                pets.map((mascota) => (
                  <Pressable
                    key={mascota.id}
                    onPress={() => setSelectedPetId(mascota.id)}
                    style={[styles.petCard, selectedPetId === mascota.id && styles.petCardSelected]}
                  >
                    <View style={[styles.petAvatar, { backgroundColor: getPetAvatarColor(mascota.nombre) }]}>
                      <Text style={styles.petAvatarText}>{getPetInitials(mascota.nombre)}</Text>
                    </View>
                    <View style={styles.petCardInfo}>
                      <Text style={styles.petCardName}>{mascota.nombre}</Text>
                      <Text style={styles.petCardBreed}>
                        {mascota.raza} · {getPetTypeLabel(mascota.tipo)}
                      </Text>
                    </View>
                    {selectedPetId === mascota.id && (
                      <View style={styles.petCardCheck}>
                        <Text style={styles.petCardCheckText}>✓</Text>
                      </View>
                    )}
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
                  <Text style={styles.dateButtonLabel}>
                    Fecha de entrada<Text style={styles.required}> *</Text>
                  </Text>
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
                    minimumDate={new Date()}
                    onChange={handleCheckInDateChange}
                  />
                )}

                <Pressable
                  onPress={() => setShowCheckOutPicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonLabel}>
                    Fecha de salida<Text style={styles.required}> *</Text>
                  </Text>
                  <Text style={styles.dateButtonValue}>
                    {fechaSalida ? format(fechaSalida, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                  </Text>
                </Pressable>
                {errors.fechaSalida && (
                  <Text style={styles.errorText}>{errors.fechaSalida}</Text>
                )}

                {showCheckOutPicker && (
                  <DateTimePicker
                    value={fechaSalida || (fechaEntrada ? addDays(fechaEntrada, 1) : new Date())}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={fechaEntrada ? addDays(fechaEntrada, 1) : new Date()}
                    onChange={handleCheckOutDateChange}
                  />
                )}
              </>
            )}
          </View>

          {datesSelected && calculateNights() > 0 && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Buscar habitaciones</Text>
                {!roomsSearched ? (
                  <Button
                    title={loadingRooms ? 'Buscando habitaciones...' : 'Buscar habitaciones disponibles'}
                    onPress={loadAvailableRooms}
                    isLoading={loadingRooms}
                    fullWidth
                  />
                ) : (
                  <Button
                    title="Buscar de nuevo"
                    onPress={loadAvailableRooms}
                    isLoading={loadingRooms}
                    fullWidth
                    variant="secondary"
                  />
                )}
              </View>

              {roomsSearched && (
                <View style={styles.section}>
                  <View style={styles.roomSectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Seleccionar habitación<Text style={styles.required}> *</Text>
                    </Text>
                    {rooms.length > 0 && (
                      <Text style={styles.roomCount}>
                        {rooms.filter((r) => r.disponible !== false).length} disponibles
                      </Text>
                    )}
                  </View>
                  {errors.habitacion && (
                    <Text style={styles.errorText}>{errors.habitacion}</Text>
                  )}
                  {rooms.length === 0 ? (
                    <View style={styles.roomEmptyState}>
                      <Text style={styles.roomEmptyIcon}>🔍</Text>
                      <Text style={styles.roomEmptyText}>No hay habitaciones registradas</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.roomChipGrid}>
                        {rooms.map((room) => {
                          const isSelected = selectedHabitacionId === room.id;
                          const isUnavailable = room.disponible === false;
                          return (
                            <Pressable
                              key={room.id}
                              onPress={() => setSelectedHabitacionId(room.id)}
                              style={[
                                styles.roomChip,
                                isSelected && styles.roomChipSelected,
                                isUnavailable && styles.roomChipUnavailable,
                              ]}
                              disabled={loadingRooms || isUnavailable}
                            >
                              <Text style={[
                                styles.roomChipPrefix,
                                isSelected && styles.roomChipPrefixSelected,
                                isUnavailable && styles.roomChipTextUnavailable,
                              ]}>
                                Hab.
                              </Text>
                              <Text style={[
                                styles.roomChipNumber,
                                isSelected && styles.roomChipNumberSelected,
                                isUnavailable && styles.roomChipTextUnavailable,
                              ]}>
                                {room.name}
                              </Text>
                              {isSelected && <Text style={styles.roomChipCheck}> ✓</Text>}
                              {isUnavailable && (
                                <Text style={styles.roomChipUnavailableLabel}> Ocupada</Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                      {currentPage < totalPages && (
                        <Button
                          title="Cargar más habitaciones"
                          onPress={() => loadAvailableRooms(currentPage + 1)}
                          isLoading={loadingRooms}
                          variant="secondary"
                          fullWidth
                          style={{ marginTop: Spacing.md }}
                        />
                      )}
                    </>
                  )}
                </View>
              )}

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

          <View style={styles.checklist}>
            <Text style={styles.checklistTitle}>Para completar tu reserva:</Text>

            <View style={styles.checklistRow}>
              <View style={[styles.checklistDot, selectedPetId && styles.checklistDotDone]}>
                {selectedPetId && <Text style={styles.checklistDotCheck}>✓</Text>}
              </View>
              <Text style={[styles.checklistText, selectedPetId && styles.checklistTextDone]}>
                {selectedPetId
                  ? `Mascota: ${pets.find((p) => p.id === selectedPetId)?.nombre}`
                  : 'Selecciona una mascota'}
              </Text>
            </View>

            <View style={styles.checklistRow}>
              <View style={[styles.checklistDot, (datesSelected && calculateNights() > 0) && styles.checklistDotDone]}>
                {datesSelected && calculateNights() > 0 && <Text style={styles.checklistDotCheck}>✓</Text>}
              </View>
              <Text style={[styles.checklistText, (datesSelected && calculateNights() > 0) && styles.checklistTextDone]}>
                {datesSelected && calculateNights() > 0
                  ? `Número de noches: ${calculateNights()}`
                  : 'Selecciona fechas de entrada y salida'}
              </Text>
            </View>

            <View>
              <View style={styles.checklistRow}>
                <View style={[styles.checklistDot, selectedHabitacionId && styles.checklistDotDone]}>
                  {selectedHabitacionId && <Text style={styles.checklistDotCheck}>✓</Text>}
                </View>
                <Text style={[styles.checklistText, selectedHabitacionId && styles.checklistTextDone]}>
                  {selectedHabitacionId
                    ? `Habitación: ${rooms.find((r) => r.id === selectedHabitacionId)?.name}`
                    : 'Selecciona una habitación'}
                </Text>
              </View>
              {!selectedHabitacionId && datesSelected && calculateNights() > 0 && !roomsSearched && (
                <Text style={styles.checklistHint}>
                  Primero busca habitaciones disponibles para tus fechas
                </Text>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Crear reserva"
              onPress={handleSubmit}
              fullWidth
              size="lg"
              isLoading={isSubmitting}
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

