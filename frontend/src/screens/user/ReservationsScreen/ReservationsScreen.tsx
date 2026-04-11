import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Spacing, Colors } from '@/src/utils/theme';
import { Reserva, EstadoReserva, ScreenProps } from '@/src/types';
import { reservationsService } from '@/src/services/api/reservations.service';
import { styles } from './ReservationsScreen.styles';

type FilterType = 'all' | string;

const getStatusPriority = (estado: EstadoReserva): number => {
  const n = String(estado).toUpperCase().replace(/ /g, '_');
  switch (n) {
    case 'CONFIRMADA': return 1;
    case 'EN_PROGRESO': return 2;
    case 'COMPLETADA': return 3;
    case 'CANCELADA': return 4;
    default: return 5;
  }
};

export const ReservationsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadReservations = async (currentFilter: FilterType = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const estado = currentFilter === 'all' ? undefined : currentFilter;
      const [data, statusList] = await Promise.all([
        reservationsService.getReservations(estado),
        reservationsService.getStatuses(),
      ]);
      setReservations(data as Reserva[]);
      setStatuses(statusList);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar reservas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations(filter);
  }, [filter]);

  // Refresh when screen is focused (e.g., returning from detail screen)
  useFocusEffect(
    React.useCallback(() => {
      loadReservations(filter);
    }, [filter])
  );

  const filteredReservations = [...reservations]
    .sort((a, b) => getStatusPriority(a.estado) - getStatusPriority(b.estado));

  const handleCancelReservation = async (resId: string, nombreMascota: string) => {
    Alert.alert(
      'Cancelar reserva',
      `¿Estás seguro de que quieres cancelar la reserva de ${nombreMascota}?`,
      [
        { text: 'Mantener', onPress: () => {} },
        {
          text: 'Cancelar reserva',
          onPress: async () => {
            try {
              await reservationsService.cancelReservation(resId);
              await loadReservations();
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

  const getStatusColor = (estado: EstadoReserva) => {
    const normalizedEstado = String(estado).toUpperCase().replace(/ /g, '_');
    switch (normalizedEstado) {
      case 'EN_PROGRESO':
        return styles.statusInProgress;
      case 'CONFIRMADA':
        return styles.statusConfirmed;
      case 'COMPLETADA':
        return styles.statusCompleted;
      case 'CANCELADA':
        return styles.statusInProgress;
      default:
        return styles.statusInProgress;
    }
  };

  const getStatusLabel = (estado: EstadoReserva) => {
    const normalizedEstado = String(estado).toUpperCase().replace(/ /g, '_');
    switch (normalizedEstado) {
      case 'EN_PROGRESO':
        return 'En progreso';
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'COMPLETADA':
        return 'Completada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <Text style={styles.emptyText}>{error}</Text>
          <Button
            title="Reintentar"
            onPress={loadReservations}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      ) : (
        <FlatList
          extraData={{ statuses, filter }}
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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}
              >
                <Pressable
                  key="all"
                  onPress={() => setFilter('all')}
                  style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
                    Todas
                  </Text>
                </Pressable>
                {statuses.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setFilter(status)}
                    style={[styles.filterChip, filter === status && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, filter === status && styles.filterChipTextActive]}>
                      {getStatusLabel(status as EstadoReserva)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          }
          data={filteredReservations}
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
                    <Text style={styles.detailValue}>{item.habitacion}</Text>
                  </View>
                </View>
                {item.estado !== 'COMPLETADA' && item.estado !== 'completada' && (
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
                    {item.estado !== 'CANCELADA' && item.estado !== 'cancelada' && (
                      <Button
                        title="Cancelar"
                        onPress={() => handleCancelReservation(item.id, item.nombreMascota)}
                        variant="destructive"
                        size="sm"
                        style={styles.cancelButton}
                      />
                    )}
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
        />
      )}
    </SafeAreaView>
  );
};
