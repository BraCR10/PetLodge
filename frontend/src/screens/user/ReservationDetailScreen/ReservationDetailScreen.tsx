import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Toast } from '@/src/components/ui/Toast';
import { Card } from '@/src/components/ui/Card';
import { useToast } from '@/src/hooks/useToast';
import { Colors, Spacing, Typography } from '@/src/utils/theme';
import { Reserva, EstadoReserva, ScreenPropsWithRoute } from '@/src/types';
import { reservationsService } from '@/src/services/api/reservations.service';
import { styles } from './ReservationDetailScreen.styles';
import { getFriendlyErrorMessage } from '@/src/utils/errors';

export const ReservationDetailScreen: React.FC<ScreenPropsWithRoute> = ({
  navigation,
  route,
}) => {
  const reserva = route.params?.reservation;
  const [isCancelling, setIsCancelling] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const { toast, showToast } = useToast();

  if (!reserva) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Detalles de la reserva</Text>
          <Text style={Typography.body}>No hay reserva seleccionada.</Text>
          <Button
            title="Atras"
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

  const handleCancel = () => {
    Alert.alert(
      'Cancelar reserva',
      `Estas seguro de que quieres cancelar la reserva de ${reserva.nombreMascota}?`,
      [
        { text: 'Mantener', onPress: () => {} },
        {
          text: 'Cancelar reserva',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await reservationsService.cancelReservation(reserva.id);
              showToast('Reserva cancelada', 'success', () => {
                setIsCancelling(false);
                navigation.goBack();
              }, 800);
            } catch (err: any) {
              const errorMessage = getFriendlyErrorMessage(err, 'Hubo un error cancelando la reserva, vuelva a intentar');
              showToast(errorMessage, 'error');
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const canCancel = reserva.estado !== 'COMPLETADA' && reserva.estado !== 'completada' &&
                    reserva.estado !== 'CANCELADA' && reserva.estado !== 'cancelada';

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={isCancelling} transparent animationType="none">
        <View style={{ flex: 1 }} />
      </Modal>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Detalles de la reserva</Text>

        <Card padding={Spacing.lg} margin={0}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacion de la mascota</Text>
            <View style={styles.petHeader}>
              {reserva.fotoMascota && !photoFailed ? (
                <Image
                  source={{ uri: reserva.fotoMascota }}
                  style={styles.petAvatarImage}
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <View style={styles.petAvatarFallback}>
                  <Text style={styles.petAvatarFallbackText}>
                    {reserva.nombreMascota?.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.petHeaderText}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>{reserva.nombreMascota}</Text>
              </View>
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
              <Text style={styles.label}>Habitacion</Text>
              <Text style={styles.value}>{reserva.habitacion}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.label}>Tipo de reserva</Text>
              <Text style={styles.value}>
                {reserva.esEspecial ? 'Especial' : 'Estandar'}
              </Text>
            </View>
          </View>

          {reserva.esEspecial && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicios adicionales</Text>
              <View style={styles.serviciosList}>
                {reserva.serviciosAdicionales && reserva.serviciosAdicionales.length > 0 ? (
                  reserva.serviciosAdicionales.map((servicio, index) => (
                    <Text key={index} style={styles.servicioTag}>
                      * {servicio}
                    </Text>
                  ))
                ) : (
                  <Text style={Typography.body}>Ninguno</Text>
                )}
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

        {canCancel && (
          <View style={{ marginTop: Spacing.lg }}>
            <Button
              title="Cancelar reserva"
              onPress={handleCancel}
              variant="destructive"
              fullWidth
              size="lg"
              isLoading={isCancelling}
              disabled={isCancelling}
            />
          </View>
        )}

        <Button
          title="Atras"
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
