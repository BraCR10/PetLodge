// Tipos de mascotas
export type TipoMascota = 'perro' | 'gato' | 'conejo' | 'pajaro' | 'otro';

// Sexo de la mascota
export type SexoMascota = 'macho' | 'hembra';

// Tamaño de la mascota
export type TamañoMascota = 'pequeño' | 'mediano' | 'grande';

// Estados de reserva
export type EstadoReserva = 'CONFIRMADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'en progreso' | 'confirmada' | 'completada' | 'cancelada';

// Interfaz para mascota
export type Mascota = {
  id: string;
  nombre: string;
  tipo: string;
  raza: string;
  años: number;
  meses: number;
  sexo: SexoMascota;
  tamaño: TamañoMascota;
  estadoVacunacion: string;
  condicionesMedicas: string;
  numeroVeterinario: string;
  cuidadosEspeciales: string;
  foto?: string;
};

// Interfaz para habitación
export type Habitacion = {
  id: string;
  name: string;
};

// Interfaz para reserva
export type Reserva = {
  id: string;
  mascotaId: string;
  habitacionId: string;
  nombreMascota: string;
  fotoMascota?: string;
  habitacion: string;
  fechaEntrada: string;
  fechaSalida: string;
  tipoHospedaje: string;
  esEspecial: boolean;
  serviciosAdicionales: string[];
  estado: EstadoReserva;
  fechaCreacion: string;
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
  type: string;
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
