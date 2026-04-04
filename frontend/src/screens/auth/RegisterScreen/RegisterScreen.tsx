import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ScreenProps } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { Colors, Spacing } from '@/src/utils/theme';
import { styles } from './RegisterScreen.styles';

export const RegisterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { register: registerUser, isLoading } = useAuth();

  const [nombre, setNombre] = useState('');
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [email, setEmail] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');

  const [nombreError, setNombreError] = useState('');
  const [numeroIdentificacionError, setNumeroIdentificacionError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [numeroTelefonoError, setNumeroTelefonoError] = useState('');
  const [direccionError, setDireccionError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setNombreError('');
    setNumeroIdentificacionError('');
    setEmailError('');
    setNumeroTelefonoError('');
    setDireccionError('');
    setPasswordError('');
    setGeneralError('');

    if (!nombre) {
      setNombreError('El nombre completo es requerido');
      isValid = false;
    }

    if (!numeroIdentificacion) {
      setNumeroIdentificacionError('El número de identificación es requerido');
      isValid = false;
    }

    if (!email) {
      setEmailError('El correo es requerido');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('El correo no es válido');
      isValid = false;
    }

    if (!numeroTelefono) {
      setNumeroTelefonoError('El número de teléfono es requerido');
      isValid = false;
    }

    if (!direccion) {
      setDireccionError('La dirección es requerida');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setGeneralError('');
      await registerUser({
        nombre,
        numeroIdentificacion,
        email,
        password,
        numeroTelefono,
        direccion,
      });
      // Navigation will happen automatically when user is set in context
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Error al registrarse';
      setGeneralError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a PetLodge</Text>
          </View>

          <View style={styles.form}>
            {generalError ? (
              <View style={{
                backgroundColor: '#fee',
                borderRadius: 8,
                padding: Spacing.md,
                marginBottom: Spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: Colors.error || '#e74c3c',
              }}>
                <Text style={{
                  color: Colors.error || '#c0392b',
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  {generalError}
                </Text>
              </View>
            ) : null}

            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={nombre}
              onChangeText={(text) => {
                setNombre(text);
                setNombreError('');
              }}
              error={nombreError}
              required
              editable={!isLoading}
            />

            <Input
              label="Número de identificación"
              placeholder="123456789"
              value={numeroIdentificacion}
              onChangeText={(text) => {
                setNumeroIdentificacion(text);
                setNumeroIdentificacionError('');
              }}
              error={numeroIdentificacionError}
              required
              editable={!isLoading}
            />

            <Input
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              error={emailError}
              required
              editable={!isLoading}
            />

            <Input
              label="Número de teléfono"
              placeholder="70606547"
              value={numeroTelefono}
              onChangeText={(text) => {
                setNumeroTelefono(text);
                setNumeroTelefonoError('');
              }}
              keyboardType="phone-pad"
              error={numeroTelefonoError}
              required
              editable={!isLoading}
            />

            <Input
              label="Dirección"
              placeholder="Calle Principal 123, Madrid"
              value={direccion}
              onChangeText={(text) => {
                setDireccion(text);
                setDireccionError('');
              }}
              error={direccionError}
              required
              editable={!isLoading}
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
              error={passwordError}
              required
              editable={!isLoading}
            />
          </View>

          <Button
            title={isLoading ? 'Registrando...' : 'Crear cuenta'}
            onPress={handleRegister}
            fullWidth
            size="lg"
            disabled={isLoading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Text
              style={styles.link}
              onPress={() => !isLoading && navigation.goBack()}
            >
              Iniciar sesión
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
