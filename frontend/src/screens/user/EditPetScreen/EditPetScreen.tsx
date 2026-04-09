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
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { Spacing, Colors } from '@/src/utils/theme';
import { Mascota, SexoMascota, TamañoMascota, ScreenPropsWithRoute } from '@/src/types';
import { petsService } from '@/src/services/api/pets.service';
import { styles } from './EditPetScreen.styles';

export const EditPetScreen: React.FC<ScreenPropsWithRoute> = ({ navigation, route }) => {
  const mascota = route.params?.pet;
  
  // Basic information
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [raza, setRaza] = useState('');
  const [anos, setAnos] = useState('');
  const [meses, setMeses] = useState('');
  
  // Physical characteristics
  const [sexo, setSexo] = useState<SexoMascota>('MACHO');
  const [tamaño, setTamaño] = useState<TamañoMascota>('MEDIANO');
  
  // Medical information
  const [estadoVacunacion, setEstadoVacunacion] = useState('');
  const [condicionesMedicas, setCondicionesMedicas] = useState('');
  const [numeroVeterinario, setNumeroVeterinario] = useState('');
  
  // Care information
  const [cuidadosEspeciales, setCuidadosEspeciales] = useState('');
  const [foto, setFoto] = useState<any>(null);
  const [fotoUri, setFotoUri] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(mascota);

  useEffect(() => {
    if (mascota) {
      setNombre(mascota.nombre);
      setTipo(mascota.tipo.toUpperCase());
      setRaza(mascota.raza);
      setAnos(String(mascota.años));
      setMeses(String(mascota.meses));
      setSexo(mascota.sexo.toUpperCase() as SexoMascota);
      setTamaño(mascota.tamaño.toUpperCase() as TamañoMascota);
      setEstadoVacunacion(mascota.estadoVacunacion);
      setCondicionesMedicas(mascota.condicionesMedicas);
      setNumeroVeterinario(mascota.numeroVeterinario);
      setCuidadosEspeciales(mascota.cuidadosEspeciales);
      if (mascota.foto) {
        setFotoUri(mascota.foto);
      }
    }
  }, [mascota]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!tipo) newErrors.tipo = 'El tipo es requerido';
    if (!raza.trim()) newErrors.raza = 'La raza es requerida';
    if (!anos) newErrors.anos = 'Los años son requeridos';
    else if (isNaN(Number(anos)) || Number(anos) < 0) newErrors.anos = 'Los años deben ser un número válido';
    if (!meses) newErrors.meses = 'Los meses son requeridos';
    else if (isNaN(Number(meses)) || Number(meses) < 0 || Number(meses) > 11) newErrors.meses = 'Los meses deben ser entre 0 y 11';
    
    if (!estadoVacunacion.trim()) newErrors.estadoVacunacion = 'El estado de vacunación es requerido';
    if (!condicionesMedicas.trim()) newErrors.condicionesMedicas = 'Las condiciones médicas son requeridas';
    if (!numeroVeterinario.trim()) newErrors.numeroVeterinario = 'El número del veterinario es requerido';
    if (!cuidadosEspeciales.trim()) newErrors.cuidadosEspeciales = 'Los cuidados especiales son requeridos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        // Update existing pet
        await petsService.updatePet(mascota.id, {
          nombre: nombre.trim(),
          tipo,
          raza: raza.trim(),
          anos: Number(anos),
          meses: Number(meses),
          sexo,
          tamano: tamaño,
          estadoVacunacion: estadoVacunacion.trim(),
          condicionesMedicas: condicionesMedicas.trim(),
          numeroVeterinario: numeroVeterinario.trim(),
          cuidadosEspeciales: cuidadosEspeciales.trim(),
          foto: foto || undefined,
        });
      } else {
        // Create new pet
        await petsService.createPet({
          nombre: nombre.trim(),
          tipo,
          raza: raza.trim(),
          anos: Number(anos),
          meses: Number(meses),
          sexo,
          tamano: tamaño,
          estadoVacunacion: estadoVacunacion.trim(),
          condicionesMedicas: condicionesMedicas.trim(),
          numeroVeterinario: numeroVeterinario.trim(),
          cuidadosEspeciales: cuidadosEspeciales.trim(),
          foto,
        });
      }

      navigation.navigate('Pets');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 
        (isEditMode ? 'Error al actualizar mascota' : 'Error al crear mascota');
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipoOptions = [
    { tipo: 'PERRO', label: 'Perro' },
    { tipo: 'GATO', label: 'Gato' },
    { tipo: 'CONEJO', label: 'Conejo' },
    { tipo: 'PAJARO', label: 'Pájaro' },
    { tipo: 'OTRO', label: 'Otro' },
  ];

  const sexoOptions = [
    { sexo: 'MACHO' as SexoMascota, label: 'Macho' },
    { sexo: 'HEMBRA' as SexoMascota, label: 'Hembra' },
  ];

  const tamañoOptions = [
    { tamaño: 'PEQUENO' as TamañoMascota, label: 'Pequeño' },
    { tamaño: 'MEDIANO' as TamañoMascota, label: 'Mediano' },
    { tamaño: 'GRANDE' as TamañoMascota, label: 'Grande' },
  ];

  const pickImage = async () => {
    try {
      // Request permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar imágenes');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setFotoUri(uri);
        setFoto({ uri, isPicker: true });
      }
    } catch (error) {
      Alert.alert('Error', `${error instanceof Error ? error.message : 'No se pudo seleccionar la imagen'}`);
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
              <Text style={styles.label}>Tipo de mascota</Text>
              <Card padding={Spacing.md} margin={0}>
                <View style={styles.tipoGrid}>
                  {tipoOptions.map((option) => (
                    <Pressable
                      key={option.tipo}
                      onPress={() => setTipo(option.tipo)}
                      style={[
                        styles.optionButton,
                        tipo === option.tipo && styles.optionButtonSelected,
                      ]}
                    >
                      <Text style={styles.optionText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
              {errors.tipo && <Text style={styles.errorText}>{errors.tipo}</Text>}
            </View>

            <Input
              label="Raza"
              placeholder="p. ej., Golden Retriever"
              value={raza}
              onChangeText={setRaza}
              error={errors.raza}
              required
            />

            <View style={styles.ageContainer}>
              <View style={styles.ageField}>
                <Input
                  label="Años"
                  placeholder="0"
                  value={anos}
                  onChangeText={setAnos}
                  keyboardType="numeric"
                  error={errors.anos}
                  required
                />
              </View>
              <View style={styles.ageField}>
                <Input
                  label="Meses"
                  placeholder="0"
                  value={meses}
                  onChangeText={setMeses}
                  keyboardType="numeric"
                  error={errors.meses}
                  required
                />
              </View>
            </View>

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

            <Input
              label="Estado de vacunación"
              placeholder="p. ej., Vacunado con..., Pendiente"
              value={estadoVacunacion}
              onChangeText={setEstadoVacunacion}
              error={errors.estadoVacunacion}
              multiline
            />

            <Input
              label="Condiciones médicas"
              placeholder="p. ej., Diabetes, alergias"
              value={condicionesMedicas}
              onChangeText={setCondicionesMedicas}
              error={errors.condicionesMedicas}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Número del veterinario"
              placeholder="p. ej., +506 2234-5678"
              value={numeroVeterinario}
              onChangeText={setNumeroVeterinario}
              error={errors.numeroVeterinario}
              keyboardType="phone-pad"
            />

            {/* Care Information Section */}
            <Text style={styles.sectionTitle}>Información de cuidado</Text>

            <Input
              label="Cuidados especiales"
              placeholder="p. ej., Requiere paseos diarios, baños frecuentes"
              value={cuidadosEspeciales}
              onChangeText={setCuidadosEspeciales}
              error={errors.cuidadosEspeciales}
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
                {errors.foto && <Text style={styles.errorText}>{errors.foto}</Text>}
              </View>
              <View style={styles.photoPreviewContainer}>
                {fotoUri ? (
                  <Image
                    source={{ uri: fotoUri }}
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
              title={isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar mascota' : 'Añadir mascota')}
              onPress={handleSave}
              fullWidth
              size="lg"
              disabled={isSubmitting}
            />
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="secondary"
              fullWidth
              size="lg"
              disabled={isSubmitting}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
