import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Usuario, ScreenProps } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { Colors, Spacing } from '@/src/utils/theme';
import { styles } from './LoginScreen.styles';

export const LoginScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { setUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('El correo es requerido');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('El correo no es válido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = () => {
    if (!validateForm()) return;

    // TODO: Replace with actual backend API call
    // For now, create a hardcoded user from the entered email
    const hardcodedUser: Usuario = {
      id: 'user-1',
      nombre: isAdmin ? 'Admin User' : 'Juan Pérez',
      numeroIdentificacion: '123456789',
      email: email,
      numeroTelefono: '+506 2234 5678',
      direccion: 'Calle Principal 123, San José',
      fechaRegistro: new Date().toISOString().split('T')[0],
      isAdmin: isAdmin,
    };

    setUser(hardcodedUser);
    const destination = isAdmin ? 'Admin' : 'User';
    navigation.getParent()?.replace(destination);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>🐾</Text>
            <Text style={styles.logo}>PetLodge</Text>
            <Text style={styles.subtitle}>Regresa con nosotros</Text>
          </View>

          <View style={styles.form}>
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
            />

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.md,
              backgroundColor: Colors.surface,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: Colors.border,
              marginTop: Spacing.md,
            }}>
              <Text style={{
                fontSize: 14,
                color: Colors.text,
                fontWeight: '500',
              }}>Login as Admin</Text>
              <Switch
                value={isAdmin}
                onValueChange={setIsAdmin}
              />
            </View>
          </View>

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            fullWidth
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta?</Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
            >
              Registrarse
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
