import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { ScreenProps, NotificationTemplate } from '@/src/types';
import { notificationsService } from '@/src/services/api/notifications.service';
import { styles } from './NotificationCenterScreen.styles';

export const NotificationCenterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<string, NotificationTemplate>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templatesList, setTemplatesList] = useState<NotificationTemplate[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await notificationsService.getTemplates();
      setTemplatesList(list);
      
      // Convert array to object indexed by ID
      const templatesMap = list.reduce((acc: Record<string, NotificationTemplate>, template) => {
        acc[template.id] = template;
        return acc;
      }, {});
      
      setTemplates(templatesMap);
      
      // Select the first template if available
      if (list.length > 0) {
        setSelectedTemplateId(list[0].id);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al cargar plantillas';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormattedType = (tipo: string): string => {
    const typeNames: Record<string, string> = {
      REGISTRO_USUARIO: 'Registro de Usuario',
      CONFIRMACION_RESERVA: 'Confirmación de Reserva',
      MODIFICACION_RESERVA: 'Modificación de Reserva',
      INICIO_HOSPEDAJE: 'Inicio de Hospedaje',
      FIN_HOSPEDAJE: 'Fin de Hospedaje',
      ESTADO_MASCOTA: 'Estado de Mascota',
    };
    return typeNames[tipo] || tipo;
  };

  const selectedTemplate = selectedTemplateId ? templates[selectedTemplateId] : null;

  const handleSubjectChange = (text: string) => {
    if (!selectedTemplateId) return;
    setTemplates({
      ...templates,
      [selectedTemplateId]: {
        ...selectedTemplate!,
        subject: text,
      },
    });
  };

  const handleBodyChange = (text: string) => {
    if (!selectedTemplateId) return;
    setTemplates({
      ...templates,
      [selectedTemplateId]: {
        ...selectedTemplate!,
        body: text,
      },
    });
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSubmitting(true);
      await notificationsService.updateTemplate(selectedTemplate.id, {
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
      });
      Alert.alert(
        'Guardado',
        `Plantilla para "${getFormattedType(selectedTemplate.tipo)}" ha sido actualizada.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al guardar plantilla';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Centro de Notificaciones</Text>
          <Text style={styles.subtitle}>Manage notification templates</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Cargando plantillas...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Reintentar"
              onPress={loadTemplates}
              fullWidth
              style={{ marginTop: 16 }}
            />
          </View>
        ) : templatesList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay plantillas disponibles</Text>
          </View>
        ) : (
          <>
            <View style={styles.notificationTypes}>
              <Text style={styles.typeLabel}>Notification Types</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeScroll}
              >
                {templatesList.map((template) => (
                  <Pressable
                    key={template.id}
                    onPress={() => setSelectedTemplateId(template.id)}
                    style={[
                      styles.typeButton,
                      selectedTemplateId === template.id && styles.typeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedTemplateId === template.id && styles.typeButtonActiveText,
                      ]}
                    >
                      {getFormattedType(template.tipo)}
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
                    editable={!isSubmitting}
                  />

                  <Text style={styles.inputLabel}>Email body / template</Text>
                  <TextInput
                    style={styles.bodyInput}
                    placeholder="Enter email body"
                    value={selectedTemplate.body}
                    onChangeText={handleBodyChange}
                    multiline
                    placeholderTextColor="#999"
                    editable={!isSubmitting}
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
                    title={isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                    onPress={handleSave}
                    fullWidth
                    size="lg"
                    disabled={isSubmitting}
                    style={styles.saveButton}
                  />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
