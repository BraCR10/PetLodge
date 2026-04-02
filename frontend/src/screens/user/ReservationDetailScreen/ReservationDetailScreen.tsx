import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Colors, Spacing, Typography } from '@/src/utils/theme';
import { Reserva, EstadoReserva, Habitacion, ScreenPropsWithRoute } from '@/src/types';
import { styles } from './ReservationDetailScreen.styles';

const habitaciones: Habitacion[] = [
  { id: 1, name: 'Habitación Estándar A' },
  { id: 2, name: 'Habitación Estándar B' },
  { id: 3, name: 'Habitación Premium' },
  { id: 4, name: 'Suite Deluxe' },
];

export const ReservationDetailScreen: React.FC<ScreenPropsWithRoute> = ({
  navigation,
  route,
}) => {
  const reserva = route.params?.reservation;

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
    switch (estado) {
      case 'confirmada':
        return { backgroundColor: Colors.success + '20' };
      case 'pendiente':
        return { backgroundColor: Colors.warning + '20' };
      case 'cancelada':
        return { backgroundColor: Colors.error + '20' };
      case 'completada':
        return { backgroundColor: Colors.success + '20' };
      default:
        return { backgroundColor: Colors.warning + '20' };
    }
  };

  const getStatusTextColor = (estado: EstadoReserva) => {
    switch (estado) {
      case 'confirmada':
        return Colors.success;
      case 'pendiente':
        return Colors.warning;
      case 'cancelada':
        return Colors.error;
      case 'completada':
        return Colors.success;
      default:
        return Colors.warning;
    }
  };

  const getStatusLabel = (estado: EstadoReserva) => {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  };

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
            <View style={styles.detail}>
              <Text style={styles.label}>Entrada</Text>
              <Text style={styles.value}>{reserva.fechaEntrada}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.label}>Salida</Text>
              <Text style={styles.value}>{reserva.fechaSalida}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.label}>Habitación</Text>
              <Text style={styles.value}>
                {habitaciones.find(h => h.id === reserva.habitacionId)?.name || 'No disponible'}
              </Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.label}>Tipo de reserva</Text>
              <Text style={styles.value}>
                {reserva.esEspecial ? 'Especial' : 'Estándar'}
              </Text>
            </View>
          </View>

          {reserva.esEspecial && reserva.serviciosAdicionales && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicios adicionales</Text>
              <View style={styles.detail}>
                <Text style={styles.label}>Solicitados</Text>
                <Text style={styles.value}>{reserva.serviciosAdicionales}</Text>
              </View>
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
};
