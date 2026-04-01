import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { Spacing, Colors } from '@/src/utils/theme';
import { Mascota, TipoMascota, SexoMascota, TamañoMascota, ScreenPropsWithRoute } from '@/src/types';
import { styles } from './EditPetScreen.styles';

export const EditPetScreen: React.FC<ScreenPropsWithRoute> = ({ navigation, route }) => {
  const mascota = route.params?.pet;
  
  // Basic information
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoMascota>('perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  
  // Physical characteristics
  const [sexo, setSexo] = useState<SexoMascota>('macho');
  const [tamaño, setTamaño] = useState<TamañoMascota>('mediano');
  
  // Medical information
  const [estadoVacunacion, setEstadoVacunacion] = useState(false);
  const [condicionesMedicas, setCondicionesMedicas] = useState('');
  const [numeroVeterinario, setNumeroVeterinario] = useState('');
  
  // Care information
  const [cuidadosEspeciales, setCuidadosEspeciales] = useState('');
  const [foto, setFoto] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = Boolean(mascota);

  useEffect(() => {
    if (mascota) {
      setNombre(mascota.nombre);
      setTipo(mascota.tipo);
      setRaza(mascota.raza);
      setEdad(String(mascota.edad));
      setSexo(mascota.sexo);
      setTamaño(mascota.tamaño);
      setEstadoVacunacion(mascota.estadoVacunacion);
      setCondicionesMedicas(mascota.condicionesMedicas);
      setNumeroVeterinario(mascota.numeroVeterinario);
      setCuidadosEspeciales(mascota.cuidadosEspeciales);
      if (mascota.foto) setFoto(mascota.foto);
    }
  }, [mascota]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nombre) newErrors.nombre = 'El nombre es requerido';
    if (!raza) newErrors.raza = 'La raza es requerida';
    if (!edad) newErrors.edad = 'La edad es requerida';
    else if (isNaN(Number(edad)) || Number(edad) < 0) newErrors.edad = 'La edad debe ser un número válido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    Alert.alert('Guardado', 'La información de la mascota se guardó localmente.', [
      { text: 'Aceptar', onPress: () => navigation.goBack() },
    ]);
  };

  const tipoMascotaOptions = [
    { tipo: 'perro' as TipoMascota, icon: '🐕', label: 'Perro' },
    { tipo: 'gato' as TipoMascota, icon: '🐈', label: 'Gato' },
    { tipo: 'conejo' as TipoMascota, icon: '🐰', label: 'Conejo' },
    { tipo: 'pajaro' as TipoMascota, icon: '🐦', label: 'Pájaro' },
    { tipo: 'otro' as TipoMascota, icon: '🐾', label: 'Otro' },
  ];

  const sexoOptions = [
    { sexo: 'macho' as SexoMascota, label: 'Macho' },
    { sexo: 'hembra' as SexoMascota, label: 'Hembra' },
  ];

  const tamañoOptions = [
    { tamaño: 'pequeño' as TamañoMascota, label: 'Pequeño' },
    { tamaño: 'mediano' as TamañoMascota, label: 'Mediano' },
    { tamaño: 'grande' as TamañoMascota, label: 'Grande' },
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>
            {isEditMode ? 'Editar mascota' : 'Añadir nueva mascota'}
          </Text>

          <View style={styles.form}>
            {/* Basic Information Section */}
            <Text style={styles.sectionTitle}>Información básica</Text>
            
            <Input
              label="Nombre de la mascota"
              placeholder="p. ej., Max"
              value={nombre}
              onChangeText={setNombre}
              error={errors.nombre}
              required
            />

            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Tipo de mascota</Text>
              <Card padding={Spacing.md} margin={0}>
                <View style={styles.typeGrid}>
                  {tipoMascotaOptions.map((option) => (
                    <Pressable
                      key={option.tipo}
                      onPress={() => setTipo(option.tipo)}
                      style={[
                        styles.typeButton,
                        tipo === option.tipo && styles.typeButtonSelected,
                      ]}
                    >
                      <Text style={styles.typeIcon}>{option.icon}</Text>
                      <Text style={styles.typeName}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            </View>

            <Input
              label="Raza"
              placeholder="p. ej., Golden Retriever"
              value={raza}
              onChangeText={setRaza}
              error={errors.raza}
              required
            />

            <Input
              label="Edad (años)"
              placeholder="p. ej., 3"
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              error={errors.edad}
              required
            />

            {/* Physical Characteristics Section */}
            <Text style={styles.sectionTitle}>Características físicas</Text>

            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Sexo</Text>
              <Card padding={Spacing.md} margin={0}>
                <View style={styles.sexoGrid}>
                  {sexoOptions.map((option) => (
                    <Pressable
                      key={option.sexo}
                      onPress={() => setSexo(option.sexo)}
                      style={[
                        styles.optionButton,
                        sexo === option.sexo && styles.optionButtonSelected,
                      ]}
                    >
                      <Text style={styles.optionText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            </View>

            <View style={styles.typeContainer}>
              <Text style={styles.typeLabel}>Tamaño</Text>
              <Card padding={Spacing.md} margin={0}>
                <View style={styles.tamañoGrid}>
                  {tamañoOptions.map((option) => (
                    <Pressable
                      key={option.tamaño}
                      onPress={() => setTamaño(option.tamaño)}
                      style={[
                        styles.optionButton,
                        tamaño === option.tamaño && styles.optionButtonSelected,
                      ]}
                    >
                      <Text style={styles.optionText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            </View>

            {/* Medical Information Section */}
            <Text style={styles.sectionTitle}>Información médica</Text>

            <View style={styles.vacunacionContainer}>
              <View style={styles.vacunacionLabel}>
                <Text style={styles.label}>Estado de vacunación</Text>
                <Text style={styles.labelText}>{estadoVacunacion ? 'Vacunado' : 'Sin vacunar'}</Text>
              </View>
              <Switch
                value={estadoVacunacion}
                onValueChange={setEstadoVacunacion}
              />
            </View>

            <Input
              label="Condiciones médicas"
              placeholder="p. ej., Diabetes, alergias"
              value={condicionesMedicas}
              onChangeText={setCondicionesMedicas}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Número del veterinario"
              placeholder="p. ej., +506 2234-5678"
              value={numeroVeterinario}
              onChangeText={setNumeroVeterinario}
              keyboardType="phone-pad"
            />

            {/* Care Information Section */}
            <Text style={styles.sectionTitle}>Información de cuidado</Text>

            <Input
              label="Cuidados especiales"
              placeholder="p. ej., Requiere paseos diarios, baños frecuentes"
              value={cuidadosEspeciales}
              onChangeText={setCuidadosEspeciales}
              multiline
              numberOfLines={3}
            />

            <View style={styles.photoContainer}>
              <View style={styles.photoSection}>
                <Text style={styles.label}>Foto de la mascota</Text>
                <Button
                  title="Seleccionar imagen"
                  onPress={pickImage}
                  variant="secondary"
                  fullWidth
                  size="md"
                  style={styles.photoButton}
                />
              </View>
              <View style={styles.photoPreviewContainer}>
                {foto ? (
                  <Image
                    source={{ uri: foto }}
                    style={styles.photoPreview}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>📷</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title={isEditMode ? 'Actualizar mascota' : 'Añadir mascota'}
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
