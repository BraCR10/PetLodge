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
import { Reserva, EstadoReserva, ScreenProps } from '@/src/types';
import { styles } from './ReservationsScreen.styles';

const initialReservations: Reserva[] = [
  {
    id: "1",
    nombreMascota: 'Max',
    fechaEntrada: '2026-04-01',
    fechaSalida: '2026-04-05',
    habitacionId: "1",
    estado: 'confirmada',
    esEspecial: false,
  },
  {
    id: "2",
    nombreMascota: 'Luna',
    fechaEntrada: '2026-05-10',
    fechaSalida: '2026-05-12',
    habitacionId: "2",
    estado: 'en progreso',
    esEspecial: true,
    serviciosAdicionales: ['paseo', 'baño'],
  },
];

export const ReservationsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [reservations, setReservations] = useState(initialReservations);

  const handleCancelReservation = (resId: string, nombreMascota: string) => {
    Alert.alert(
      'Cancelar reserva',
      `¿Estás seguro de que quieres cancelar la reserva de ${nombreMascota}?`,
      [
        { text: 'Mantener', onPress: () => {} },
        {
          text: 'Cancelar reserva',
          onPress: () => {
            setReservations((prev) =>
              prev.filter((reservation) => reservation.id !== resId)
            );
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (estado: EstadoReserva) => {
    switch (estado) {
      case 'en progreso':
        return styles.statusInProgress;
      case 'confirmada':
        return styles.statusConfirmed;
      case 'completada':
        return styles.statusCompleted;
      default:
        return styles.statusInProgress;
    }
  };

  const getStatusLabel = (estado: EstadoReserva) => {
    switch (estado) {
      case 'en progreso':
        return 'En progreso';
      case 'confirmada':
        return 'Confirmada';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Reservas</Text>
              <Button
                title="Nueva reserva"
                onPress={() => navigation.navigate('NewReservation')}
                size="sm"
                style={styles.addButton}
              />
            </View>
          </View>
        }
        data={reservations}
        renderItem={({ item }) => (
          <View style={[styles.content, styles.contentNoVerticalPadding]}>
            <Card padding={Spacing.md} margin={0}>
              <View style={styles.cardHeader}>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.nombreMascota}</Text>
                  {item.esEspecial && (
                    <Text style={styles.specialBadge}>⭐ Reserva especial</Text>
                  )}
                </View>
                <Text style={[styles.status, getStatusColor(item.estado)]}>
                  {getStatusLabel(item.estado)}
                </Text>
              </View>
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Entrada</Text>
                  <Text style={styles.detailValue}>{item.fechaEntrada}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Salida</Text>
                  <Text style={styles.detailValue}>{item.fechaSalida}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Habitación</Text>
                  <Text style={styles.detailValue}>Habitación {item.habitacionId}</Text>
                </View>
              </View>
              {item.estado !== 'completada' && (
                <View style={styles.actions}>
                  <Button
                    title="Ver detalles"
                    onPress={() =>
                      navigation.navigate('ReservationDetail', {
                        reservation: item,
                      })
                    }
                    variant="secondary"
                    size="sm"
                    style={styles.detailsButton}
                  />
                  <Button
                    title="Cancelar"
                    onPress={() => handleCancelReservation(item.id, item.nombreMascota)}
                    variant="destructive"
                    size="sm"
                    style={styles.cancelButton}
                  />
                </View>
              )}
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Aún no tienes reservas</Text>
            <Button
              title="Hacer una reserva"
              onPress={() => navigation.navigate('NewReservation')}
            />
          </View>
        }
        scrollEnabled={false}
      />
    </SafeAreaView>
  );
};
