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
import { styles } from './RegisterScreen.styles';

export const RegisterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [idNumberError, setIdNumberError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setIdNumberError('');
    setEmailError('');
    setPhoneNumberError('');
    setAddressError('');
    setPasswordError('');

    if (!name) {
      setNameError('El nombre completo es requerido');
      isValid = false;
    }

    if (!idNumber) {
      setIdNumberError('El número de identificación es requerido');
      isValid = false;
    }

    if (!email) {
      setEmailError('El correo es requerido');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('El correo no es válido');
      isValid = false;
    }

    if (!phoneNumber) {
      setPhoneNumberError('El número de teléfono es requerido');
      isValid = false;
    }

    if (!address) {
      setAddressError('La dirección es requerida');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    navigation.getParent()?.getParent()?.replace('User');
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
            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError('');
              }}
              error={nameError}
              required
            />

            <Input
              label="Número de identificación"
              placeholder="123456789"
              value={idNumber}
              onChangeText={(text) => {
                setIdNumber(text);
                setIdNumberError('');
              }}
              error={idNumberError}
              required
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
            />

            <Input
              label="Número de teléfono"
              placeholder="70606547"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setPhoneNumberError('');
              }}
              keyboardType="phone-pad"
              error={phoneNumberError}
              required
            />

            <Input
              label="Dirección"
              placeholder="Calle Principal 123, Madrid"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                setAddressError('');
              }}
              error={addressError}
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
          </View>

          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            fullWidth
            size="lg"
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Text
              style={styles.link}
              onPress={() => navigation.goBack()}
            >
              Iniciar sesión
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
