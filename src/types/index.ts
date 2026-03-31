// Tipos de mascotas
export type TipoMascota = 'perro' | 'gato' | 'conejo' | 'pajaro' | 'otro';

// Sexo de la mascota
export type SexoMascota = 'macho' | 'hembra';

// Tamaño de la mascota
export type TamañoMascota = 'pequeño' | 'mediano' | 'grande';

// Estados de reserva
export type EstadoReserva = 'en progreso' | 'confirmada' | 'completada';

// Interfaz para mascota
export type Mascota = {
  id: string;
  nombre: string;
  tipo: TipoMascota;
  raza: string;
  edad: number;
  sexo: SexoMascota;
  tamaño: TamañoMascota;
  estadoVacunacion: boolean;
  condicionesMedicas: string;
  numeroVeterinario: string;
  cuidadosEspeciales: string;
  foto?: string;
};

// Interfaz para reserva
export type Reserva = {
  id: string;
  nombreMascota: string;
  fechaEntrada: string;
  fechaSalida: string;
  habitacion: string;
  estado: EstadoReserva;
};

// Interfaz para usuario
export type Usuario = {
  id: string;
  nombre: string;
  numeroIdentificacion: string;
  email: string;
  numeroTelefono?: string;
  direccion?: string;
  fechaRegistro: string;
  isAdmin?: boolean;
};

// Interfaz para plantilla de notificación
export type NotificationTemplate = {
  id: string;
  name: string;
  icon: string;
  subject: string;
  body: string;
  variables: string[];
};

// Props base para pantallas
export interface ScreenProps {
  navigation: any;
}

export interface ScreenPropsWithRoute extends ScreenProps {
  route: any;
}
