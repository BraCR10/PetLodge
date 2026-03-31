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
    id: 'user-registration',
    name: 'User registration',
    icon: '👤',
    subject: 'Welcome to PetLodge',
    body: 'Dear {name},\n\nThank you for registering with PetLodge. Your account has been successfully created.\n\nBest regards,\nPetLodge Team',
    variables: ['name', 'email'],
  },
  {
    id: 'reservation-confirmation',
    name: 'Reservation confirmation',
    icon: '✓',
    subject: 'Reservation Confirmed',
    body: 'Dear {name},\n\nYour reservation for {petName} has been confirmed for {checkInDate} to {checkOutDate}.\n\nRoom: {roomNumber}\n\nBest regards,\nPetLodge Team',
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate', 'roomNumber'],
  },
  {
    id: 'reservation-modification',
    name: 'Reservation modification',
    icon: '✏️',
    subject: 'Reservation Modified',
    body: 'Dear {name},\n\nYour reservation for {petName} has been modified.\n\nNew dates: {checkInDate} to {checkOutDate}\n\nBest regards,\nPetLodge Team',
    variables: ['name', 'petName', 'checkInDate', 'checkOutDate'],
  },
  {
    id: 'logging-start',
    name: 'Logging start',
    icon: '🏠',
    subject: 'Pet Check-In Successful',
    body: 'Dear {name},\n\n{petName} has been successfully checked in to PetLodge.\n\nCheck-in time: {checkInTime}\n\nBest regards,\nPetLodge Team',
    variables: ['name', 'petName', 'checkInTime'],
  },
  {
    id: 'logging-end',
    name: 'Logging end',
    icon: '👋',
    subject: 'Pet Check-Out Complete',
    body: 'Dear {name},\n\n{petName} has been successfully checked out from PetLodge.\n\nThank you for choosing us!\n\nBest regards,\nPetLodge Team',
    variables: ['name', 'petName'],
  },
  {
    id: 'pet-status-update',
    name: 'Pet status update',
    icon: '🐾',
    subject: 'Update on your pet',
    body: 'Dear {name},\n\nWe wanted to update you on {petName}:\n\n{statusMessage}\n\nBest regards,\nPetLodge Team',
    variables: ['name', 'petName', 'statusMessage'],
  },
];

export const NotificationCenterScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const [selectedTypeId, setSelectedTypeId] = useState('user-registration');
  const [templates, setTemplates] = useState<Record<string, NotificationTemplate>>(
    notificationTypes.reduce((acc: Record<string, NotificationTemplate>, template) => {
      acc[template.id] = template;
      return acc;
    }, {})
  );

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
      'Success',
      `Template for "${selectedTemplate.name}" has been saved.`,
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
                  {type.icon} {type.name}
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
