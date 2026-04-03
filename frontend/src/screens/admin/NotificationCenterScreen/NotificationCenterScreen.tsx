import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { ScreenProps, NotificationTemplate } from '@/src/types';
import { styles } from './NotificationCenterScreen.styles';

const notificationTypes: NotificationTemplate[] = [
  {
    id: '1',
    type: 'REGISTRO_USUARIO',
    subject: 'Bienvenido a PetLodge',
    body: 'Estimado {name},\n\nGracias por registrarte en PetLodge. Tu cuenta ha sido creada exitosamente.\n\nSaludos cordiales,\nEquipo de PetLodge',
    variables: ['name', 'email'],
  },
  {
    id: '2',
    type: 'CONFIRMACION_RESERVA',
    subject: 'Reserva Confirmada',
    body: 'Estimado {name},\n\nTu reserva para {petName} ha sido confirmada para {checkInDate} a {checkOutDate}.\n\nHabitación: {roomNumber}\n\nSaludos cordiales,\nEquipo de PetLodge',
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate', 'roomNumber'],
  },
  {
    id: '3',
    type: 'MODIFICACION_RESERVA',
    subject: 'Reserva Modificada',
    body: 'Estimado {name},\n\nTu reserva para {petName} ha sido modificada.\n\nNuevas fechas: {checkInDate} a {checkOutDate}\n\nSaludos cordiales,\nEquipo de PetLodge',
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate'],
  },
  {
    id: '4',
    type: 'INICIO_HOSPEDAJE',
    subject: 'Entrada Exitosa',
    body: 'Estimado {name},\n\n{petName} ha sido ingresado exitosamente a PetLodge.\n\nHora de entrada: {checkInTime}\n\nSaludos cordiales,\nEquipo de PetLodge',
    variables: ['name', 'petName', 'checkInTime'],
  },
  {
    id: '5',
    type: 'FIN_HOSPEDAJE',
    subject: 'Salida Completada',
    body: 'Estimado {name},\n\n{petName} ha sido retirado exitosamente de PetLodge.\n\n¡Gracias por elegirnos!\n\nSaludos cordiales,\nEquipo de PetLodge',
    variables: ['name', 'petName'],
  },
  {
    id: '6',
    type: 'ESTADO_MASCOTA',
    subject: 'Actualización sobre tu mascota',
    body: 'Estimado {name},\n\nQueríamos actualizarte sobre {petName}:\n\n{statusMessage}\n\nSaludos cordiales,\nEquipo de PetLodge',
    variables: ['name', 'petName', 'statusMessage'],
  },
];

export const NotificationCenterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [selectedTypeId, setSelectedTypeId] = useState('1');
  const [templates, setTemplates] = useState<Record<string, NotificationTemplate>>(
    notificationTypes.reduce((acc: Record<string, NotificationTemplate>, template) => {
      acc[template.id] = template;
      return acc;
    }, {})
  );

  const getFormattedType = (type: string): string => {
    const typeNames: Record<string, string> = {
      REGISTRO_USUARIO: 'Registro de Usuario',
      CONFIRMACION_RESERVA: 'Confirmación de Reserva',
      MODIFICACION_RESERVA: 'Modificación de Reserva',
      INICIO_HOSPEDAJE: 'Inicio de Hospedaje',
      FIN_HOSPEDAJE: 'Fin de Hospedaje',
      ESTADO_MASCOTA: 'Estado de Mascota',
    };
    return typeNames[type] || type;
  };

  const selectedTemplate = templates[selectedTypeId];

  const handleSubjectChange = (text: string) => {
    setTemplates({
      ...templates,
      [selectedTypeId]: {
        ...selectedTemplate,
        subject: text,
      },
    });
  };

  const handleBodyChange = (text: string) => {
    setTemplates({
      ...templates,
      [selectedTypeId]: {
        ...selectedTemplate,
        body: text,
      },
    });
  };

  const handleSave = () => {
    Alert.alert(
      'Guardado',
      `Plantilla para "${getFormattedType(templates[selectedTypeId].type)}" ha sido guardada.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Centro de Notificaciones</Text>
          <Text style={styles.subtitle}>Manage notification templates</Text>
        </View>

        <View style={styles.notificationTypes}>
          <Text style={styles.typeLabel}>Notification Types</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
          >
            {notificationTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setSelectedTypeId(type.id)}
                style={[
                  styles.typeButton,
                  selectedTypeId === type.id && styles.typeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedTypeId === type.id && styles.typeButtonActiveText,
                  ]}
                >
                  {getFormattedType(type.type)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {selectedTemplate && (
          <>
            <View style={styles.editorSection}>
              <Text style={styles.sectionTitle}>Email Template Editor</Text>

              <Text style={styles.inputLabel}>Email subject</Text>
              <TextInput
                style={styles.subjectInput}
                placeholder="Enter email subject"
                value={selectedTemplate.subject}
                onChangeText={handleSubjectChange}
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Email body / template</Text>
              <TextInput
                style={styles.bodyInput}
                placeholder="Enter email body"
                value={selectedTemplate.body}
                onChangeText={handleBodyChange}
                multiline
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.variablesSection}>
              <Text style={styles.variablesTitle}>Available variables:</Text>
              <View style={styles.variablesList}>
                {selectedTemplate.variables.map((variable) => (
                  <View key={variable} style={styles.variableTag}>
                    <Text style={styles.variableTagText}>{`{${variable}}`}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                title="Save changes"
                onPress={handleSave}
                fullWidth
                size="lg"
                style={styles.saveButton}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
