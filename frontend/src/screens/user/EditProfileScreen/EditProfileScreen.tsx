import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenPropsWithRoute } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
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

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setNumeroIdentificacion(user.numeroIdentificacion);
      setEmail(user.email);
      setNumeroTelefono(user.numeroTelefono);
      setDireccion(user.direccion);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nombre) newErrors.nombre = 'El nombre completo es requerido';

    if (!numeroIdentificacion)
      newErrors.numeroIdentificacion =
        'El número de identificación es requerido';

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }

    if (!numeroTelefono)
      newErrors.numeroTelefono = 'El número de teléfono es requerido';

    if (!direccion) newErrors.direccion = 'La dirección es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Update user in context
    updateUser({
      nombre,
      numeroIdentificacion,
      email,
      numeroTelefono,
      direccion,
    });

    Alert.alert('Cambios guardados', 'Tu información de perfil se actualizó.', [
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
          <Text style={styles.title}>Editar perfil</Text>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Información personal</Text>

            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={nombre}
              onChangeText={setNombre}
              error={errors.nombre}
              required
            />

            <Input
              label="Número de identificación"
              placeholder="123456789"
              value={numeroIdentificacion}
              onChangeText={setNumeroIdentificacion}
              keyboardType="numeric"
              error={errors.numeroIdentificacion}
              required
            />

            <Input
              label="Correo electrónico"
              placeholder="juan@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              error={errors.email}
              required
            />

            <Input
              label="Número de teléfono"
              placeholder="+506 1234 5678"
              value={numeroTelefono}
              onChangeText={setNumeroTelefono}
              keyboardType="phone-pad"
              error={errors.numeroTelefono}
              required
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
            />
          </View>

          <View style={styles.actions}>
            <Button
              title="Guardar cambios"
              onPress={handleSave}
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
