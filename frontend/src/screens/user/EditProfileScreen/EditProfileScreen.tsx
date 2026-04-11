import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Toast } from '@/src/components/ui/Toast';
import { Input } from '@/src/components/ui/Input';
import { ScreenPropsWithRoute } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { userService } from '@/src/services/api/user.service';
import { useToast } from '@/src/hooks/useToast';
import { getFriendlyErrorMessage } from '@/src/utils/errors';
import { styles } from './EditProfileScreen.styles';

export const EditProfileScreen: React.FC<ScreenPropsWithRoute> = ({
  navigation,
}) => {
  const { user, updateUser } = useAuth();

  const [nombre, setNombre] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [email, setEmail] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setNumeroIdentificacion(user.numeroIdentificacion);
      setEmail(user.email);
      setNumeroTelefono(user.numeroTelefono || '');
      setDireccion(user.direccion || '');
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nombre) {
      newErrors.nombre = 'El nombre completo es requerido';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (!numeroIdentificacion) {
      newErrors.numeroIdentificacion = 'El número de identificación es requerido';
    } else if (numeroIdentificacion.trim().length < 5) {
      newErrors.numeroIdentificacion = 'La identificación debe tener al menos 5 caracteres';
    } else if (numeroIdentificacion.trim().length > 20) {
      newErrors.numeroIdentificacion = 'La identificación no puede exceder 20 caracteres';
    }

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }

    if (!numeroTelefono) {
      newErrors.numeroTelefono = 'El número de teléfono es requerido';
    } else if (!/^\+?[\d\s\-()]{7,20}$/.test(numeroTelefono)) {
      newErrors.numeroTelefono = 'El número de teléfono no es válido';
    }

    if (!direccion) newErrors.direccion = 'La dirección es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call API to update profile
      const updatedUser = await userService.updateProfile({
        nombre,
        numeroIdentificacion,
        email,
        numeroTelefono,
        direccion,
      });

      // Update user in context with fresh data
      updateUser({
        nombre: updatedUser.nombre,
        numeroIdentificacion: updatedUser.numeroIdentificacion,
        email: updatedUser.email,
        numeroTelefono: updatedUser.numeroTelefono,
        direccion: updatedUser.direccion,
      });

      showToast('Perfil actualizado', 'success', () => {
        setIsLoading(false);
        navigation.goBack();
      }, 800);
    } catch (error: any) {
      const code = error?.response?.data?.code;

      if (code === 'USER_EMAIL_EXISTS') {
        setErrors((prev) => ({ ...prev, email: error.response.data.message }));
      } else if (code === 'USER_ID_EXISTS') {
        setErrors((prev) => ({ ...prev, numeroIdentificacion: error.response.data.message }));
      } else {
        const errorMessage = getFriendlyErrorMessage(
          error,
          'Hubo un error actualizando el perfil, vuelva a intentar',
        );
        showToast(errorMessage, 'error');
      }

      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={styles.container}
    >
      <Modal visible={isLoading} transparent animationType="none">
        <View style={{ flex: 1 }} />
      </Modal>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Editar perfil</Text>
          <Text style={styles.requiredNote}>* Campos obligatorios</Text>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Información personal</Text>

            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={nombre}
              onChangeText={setNombre}
              error={errors.nombre}
              required
              editable={!isLoading}
            />

            <Input
              label="Número de identificación"
              placeholder="123456789"
              value={numeroIdentificacion}
              onChangeText={setNumeroIdentificacion}
              keyboardType="numeric"
              error={errors.numeroIdentificacion}
              required
              editable={!isLoading}
            />

            <Input
              label="Correo electrónico"
              placeholder="juan@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              required
              editable={!isLoading}
            />

            <Input
              label="Número de teléfono"
              placeholder="+506 1234 5678"
              value={numeroTelefono}
              onChangeText={setNumeroTelefono}
              keyboardType="phone-pad"
              error={errors.numeroTelefono}
              required
              editable={!isLoading}
            />

            <Input
              label="Dirección"
              placeholder="Calle Principal 123, Ciudad"
              value={direccion}
              onChangeText={setDireccion}
              multiline
              numberOfLines={3}
              error={errors.direccion}
              required
              editable={!isLoading}
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Guardar cambios"
              onPress={handleSave}
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            />
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="secondary"
              fullWidth
              size="lg"
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
