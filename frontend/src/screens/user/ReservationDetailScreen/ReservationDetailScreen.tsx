import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Colors, Spacing, Typography } from '@/src/utils/theme';
import { Reserva, EstadoReserva, ScreenPropsWithRoute } from '@/src/types';
import { reservationsService } from '@/src/services/api/reservations.service';
import { styles } from './ReservationDetailScreen.styles';

const isWeb = Platform.OS === 'web';

export const ReservationDetailScreen: React.FC<ScreenPropsWithRoute> = ({
  navigation,
  route,
}) => {
  const reserva = route.params?.reservation;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFechaEntrada, setEditFechaEntrada] = useState<Date>(
    reserva ? new Date(reserva.fechaEntrada) : new Date()
  );
  const [editFechaSalida, setEditFechaSalida] = useState<Date>(
    reserva ? new Date(reserva.fechaSalida) : new Date()
  );
  const [editFechaEntradaWeb, setEditFechaEntradaWeb] = useState<string>(
    reserva ? reserva.fechaEntrada : ''
  );
  const [editFechaSalidaWeb, setEditFechaSalidaWeb] = useState<string>(
    reserva ? reserva.fechaSalida : ''
  );
  const [editServiciosAdicionales, setEditServiciosAdicionales] = useState<string[]>(
    reserva?.serviciosAdicionales || []
  );
  const [showEditCheckInPicker, setShowEditCheckInPicker] = useState(false);
  const [showEditCheckOutPicker, setShowEditCheckOutPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviciosDisponibles = [
    { id: 'bano', label: 'Baño', icon: '🛁' },
    { id: 'paseo', label: 'Paseo', icon: '🚶' },
    { id: 'alimentacion especial', label: 'Alimentación especial', icon: '🍗' },
  ];

  if (!reserva) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Detalles de la reserva</Text>
          <Text style={Typography.body}>No hay reserva seleccionada.</Text>
          <Button
            title="Atrás"
            onPress={() => navigation.goBack()}
            variant="secondary"
            fullWidth
            size="lg"
            style={styles.backButton}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const getStatusColor = (estado: EstadoReserva) => {
    const normalizedEstado = String(estado).toUpperCase().replace(/ /g, '_');
    switch (normalizedEstado) {
      case 'CONFIRMADA':
        return { backgroundColor: Colors.success + '20' };
      case 'EN_PROGRESO':
        return { backgroundColor: Colors.warning + '20' };
      case 'CANCELADA':
        return { backgroundColor: Colors.error + '20' };
      case 'COMPLETADA':
        return { backgroundColor: Colors.success + '20' };
      default:
        return { backgroundColor: Colors.warning + '20' };
    }
  };

  const getStatusTextColor = (estado: EstadoReserva) => {
    const normalizedEstado = String(estado).toUpperCase().replace(/ /g, '_');
    switch (normalizedEstado) {
      case 'CONFIRMADA':
        return Colors.success;
      case 'EN_PROGRESO':
        return Colors.warning;
      case 'CANCELADA':
        return Colors.error;
      case 'COMPLETADA':
        return Colors.success;
      default:
        return Colors.warning;
    }
  };

  const getStatusLabel = (estado: EstadoReserva) => {
    const normalizedEstado = String(estado).toUpperCase().replace(/ /g, '_');
    switch (normalizedEstado) {
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'EN_PROGRESO':
        return 'En progreso';
      case 'CANCELADA':
        return 'Cancelada';
      case 'COMPLETADA':
        return 'Completada';
      default:
        return estado;
    }
  };

  const toggleServicio = (servicioId: string) => {
    setEditServiciosAdicionales(prev =>
      prev.includes(servicioId)
        ? prev.filter(s => s !== servicioId)
        : [...prev, servicioId]
    );
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (isWeb) {
      if (!editFechaEntradaWeb) newErrors.entrada = 'Fecha de entrada requerida';
      if (!editFechaSalidaWeb) newErrors.salida = 'Fecha de salida requerida';
      else if (editFechaSalidaWeb <= editFechaEntradaWeb) {
        newErrors.salida = 'La salida debe ser después de la entrada';
      }
    } else {
      if (!editFechaEntrada) newErrors.entrada = 'Fecha de entrada requerida';
      if (!editFechaSalida) newErrors.salida = 'Fecha de salida requerida';
      else if (editFechaSalida <= editFechaEntrada) {
        newErrors.salida = 'La salida debe ser después de la entrada';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditCheckInDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowEditCheckInPicker(false);
    }
    if (selectedDate) {
      setEditFechaEntrada(selectedDate);
    }
  };

  const handleEditCheckOutDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowEditCheckOutPicker(false);
    }
    if (selectedDate) {
      setEditFechaSalida(selectedDate);
    }
  };

  const handleSaveChanges = async () => {
    if (!validateEditForm()) return;

    try {
      setIsSaving(true);
      const fromDate = isWeb ? editFechaEntradaWeb : format(editFechaEntrada, 'yyyy-MM-dd');
      const toDate = isWeb ? editFechaSalidaWeb : format(editFechaSalida, 'yyyy-MM-dd');

      await reservationsService.updateReservation(reserva.id, {
        fechaEntrada: fromDate,
        fechaSalida: toDate,
        serviciosAdicionales: editServiciosAdicionales,
      });

      Alert.alert('Éxito', 'Reserva actualizada correctamente', [
        { text: 'Aceptar', onPress: () => {
          setIsEditing(false);
          navigation.goBack();
        }},
      ]);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al actualizar reserva';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar reserva',
      `¿Estás seguro de que quieres cancelar la reserva de ${reserva.nombreMascota}?`,
      [
        { text: 'Mantener', onPress: () => {} },
        {
          text: 'Cancelar reserva',
          onPress: async () => {
            try {
              await reservationsService.cancelReservation(reserva.id);
              Alert.alert('Éxito', 'Reserva cancelada correctamente', [
                { text: 'Aceptar', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              const errorMessage = err?.response?.data?.message || err?.message || 'Error al cancelar reserva';
              Alert.alert('Error', errorMessage);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const canEdit = reserva.estado !== 'COMPLETADA' && reserva.estado !== 'completada' && 
                  reserva.estado !== 'CANCELADA' && reserva.estado !== 'cancelada';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Detalles de la reserva</Text>

        <Card padding={Spacing.lg} margin={0}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de la mascota</Text>
            <View style={styles.detail}>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.value}>{reserva.nombreMascota}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la reserva</Text>
            {isEditing ? (
              <>
                <View style={styles.detail}>
                  <Text style={styles.label}>Entrada</Text>
                  {isWeb ? (
                    <Pressable
                      onPress={() => {}}
                      style={[styles.detail, { marginTop: 8 }]}
                    >
                      <Text style={styles.value}>{editFechaEntradaWeb}</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => setShowEditCheckInPicker(true)}
                        style={styles.dateButton}
                      >
                        <Text style={styles.dateButtonValue}>
                          {format(editFechaEntrada, 'dd/MM/yyyy')}
                        </Text>
                      </Pressable>
                      {showEditCheckInPicker && (
                        <DateTimePicker
                          value={editFechaEntrada}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleEditCheckInDateChange}
                        />
                      )}
                    </>
                  )}
                  {errors.entrada && <Text style={styles.errorText}>{errors.entrada}</Text>}
                </View>

                <View style={styles.detail}>
                  <Text style={styles.label}>Salida</Text>
                  {isWeb ? (
                    <Pressable
                      onPress={() => {}}
                      style={[styles.detail, { marginTop: 8 }]}
                    >
                      <Text style={styles.value}>{editFechaSalidaWeb}</Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => setShowEditCheckOutPicker(true)}
                        style={styles.dateButton}
                      >
                        <Text style={styles.dateButtonValue}>
                          {format(editFechaSalida, 'dd/MM/yyyy')}
                        </Text>
                      </Pressable>
                      {showEditCheckOutPicker && (
                        <DateTimePicker
                          value={editFechaSalida}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleEditCheckOutDateChange}
                        />
                      )}
                    </>
                  )}
                  {errors.salida && <Text style={styles.errorText}>{errors.salida}</Text>}
                </View>
              </>
            ) : (
              <>
                <View style={styles.detail}>
                  <Text style={styles.label}>Entrada</Text>
                  <Text style={styles.value}>{reserva.fechaEntrada}</Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.label}>Salida</Text>
                  <Text style={styles.value}>{reserva.fechaSalida}</Text>
                </View>
              </>
            )}
            <View style={styles.detail}>
              <Text style={styles.label}>Habitación</Text>
              <Text style={styles.value}>{reserva.habitacion}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.label}>Tipo de reserva</Text>
              <Text style={styles.value}>
                {reserva.esEspecial ? 'Especial' : 'Estándar'}
              </Text>
            </View>
          </View>

          {reserva.esEspecial && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isEditing ? 'Servicios adicionales (editables)' : 'Servicios adicionales'}
              </Text>
              {isEditing ? (
                <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {serviciosDisponibles.map((servicio) => (
                    <Pressable
                      key={servicio.id}
                      onPress={() => toggleServicio(servicio.id)}
                      style={[
                        { 
                          paddingHorizontal: 12, 
                          paddingVertical: 8, 
                          borderRadius: 20, 
                          borderWidth: 1,
                          borderColor: editServiciosAdicionales.includes(servicio.id) ? Colors.primary : Colors.border,
                          backgroundColor: editServiciosAdicionales.includes(servicio.id) ? Colors.primary + '20' : 'transparent',
                        },
                      ]}
                    >
                      <Text style={{ color: editServiciosAdicionales.includes(servicio.id) ? Colors.primary : Colors.text }}>
                        {servicio.icon} {servicio.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.serviciosList}>
                  {reserva.serviciosAdicionales && reserva.serviciosAdicionales.length > 0 ? (
                    reserva.serviciosAdicionales.map((servicio, index) => (
                      <Text key={index} style={styles.servicioTag}>
                        • {servicio}
                      </Text>
                    ))
                  ) : (
                    <Text style={Typography.body}>Ninguno</Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View>
            <Text style={styles.sectionTitle}>Estado</Text>
            <View
              style={[
                styles.statusBadge,
                getStatusColor(reserva.estado),
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusTextColor(reserva.estado) },
                ]}
              >
                {getStatusLabel(reserva.estado)}
              </Text>
            </View>
          </View>
        </Card>

        {canEdit && (
          <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
            {isEditing ? (
              <>
                <Button
                  title={isSaving ? 'Guardando...' : 'Guardar cambios'}
                  onPress={handleSaveChanges}
                  fullWidth
                  size="lg"
                  disabled={isSaving}
                />
                <Button
                  title="Cancelar edición"
                  onPress={() => {
                    setIsEditing(false);
                    setErrors({});
                  }}
                  variant="secondary"
                  fullWidth
                  size="lg"
                  disabled={isSaving}
                />
              </>
            ) : (
              <>
                <Button
                  title="Editar reserva"
                  onPress={() => setIsEditing(true)}
                  fullWidth
                  size="lg"
                />
                <Button
                  title="Cancelar reserva"
                  onPress={handleCancel}
                  variant="destructive"
                  fullWidth
                  size="lg"
                />
              </>
            )}
          </View>
        )}

        <Button
          title="Atrás"
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
          size="lg"
          style={[styles.backButton, { marginTop: Spacing.lg }]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
