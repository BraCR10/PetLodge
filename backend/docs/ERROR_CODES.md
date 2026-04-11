# Estandar de errores (API)

Todos los errores HTTP retornan este formato:

```json
{
  "statusCode": 400,
  "code": "BAD_REQUEST",
  "message": "Solicitud invalida",
  "details": ["Campo X es requerido"]
}
```

Notas:
- `message` siempre esta en espanol.
- `code` siempre esta en ingles (SCREAMING_SNAKE_CASE).
- `details` solo aparece en validaciones.

## Codigos genericos (framework)

Estos se usan cuando no hay un `code` especifico:

| Code | Status | Message |
| --- | --- | --- |
| BAD_REQUEST | 400 | Solicitud invalida |
| VALIDATION_ERROR | 400 | Datos invalidos |
| UNAUTHORIZED | 401 | No autenticado |
| FORBIDDEN | 403 | No tienes permisos para realizar esta accion |
| NOT_FOUND | 404 | Recurso no encontrado |
| CONFLICT | 409 | Conflicto de datos |
| PAYLOAD_TOO_LARGE | 413 | La solicitud es demasiado grande |
| UNSUPPORTED_MEDIA_TYPE | 415 | Tipo de contenido no soportado |
| TOO_MANY_REQUESTS | 429 | Demasiadas solicitudes |
| INTERNAL_SERVER_ERROR | 500 | Error interno del servidor |
| SERVICE_UNAVAILABLE | 503 | Servicio no disponible |

## Codigos de negocio (custom)

### Auth
| Code | Status | Message |
| --- | --- | --- |
| USER_ALREADY_EXISTS | 409 | El correo o numero de identificacion ya esta registrado |
| INVALID_CREDENTIALS | 401 | Credenciales invalidas |
| NOT_AUTHENTICATED | 401 | No autenticado |
| INVALID_TOKEN | 401 | Token invalido o expirado |
| ACCOUNT_INACTIVE | 401 | Cuenta no encontrada o inactiva |

### Users
| Code | Status | Message |
| --- | --- | --- |
| USER_EMAIL_EXISTS | 409 | El correo ya esta registrado |
| USER_ID_EXISTS | 409 | El numero de identificacion ya esta registrado |

### Pets
| Code | Status | Message |
| --- | --- | --- |
| PET_NOT_FOUND | 404 | Mascota no encontrada |
| PET_NOT_OWNER | 403 | La mascota no pertenece al usuario autenticado |
| PET_HAS_ACTIVE_RESERVATIONS | 400 | No se puede eliminar una mascota con reservas activas |

### Rooms
| Code | Status | Message |
| --- | --- | --- |
| INVALID_DATE_RANGE | 400 | La fecha from debe ser anterior a la fecha to |
| INVALID_DATE | 400 | La fecha {campo} no es valida |

### Reservations
| Code | Status | Message |
| --- | --- | --- |
| RESERVATION_NOT_MODIFIABLE | 400 | Solo se pueden modificar reservas en estado confirmada |
| PET_NOT_FOUND | 404 | Mascota no encontrada |
| PET_NOT_OWNER | 403 | La mascota no pertenece al usuario autenticado |
| PET_ALREADY_RESERVED | 409 | La mascota ya tiene una reserva activa en el rango de fechas solicitado |
| ROOM_NOT_FOUND | 404 | Habitacion no encontrada |
| RESERVATION_NOT_FOUND | 404 | Reserva no encontrada |
| RESERVATION_NOT_OWNER | 403 | La reserva no pertenece al usuario autenticado |
| ROOM_NOT_AVAILABLE | 409 | La habitacion ya tiene una reserva activa en el rango de fechas solicitado |
| INVALID_DATE_RANGE | 400 | La fechaEntrada debe ser anterior a la fechaSalida |
| INVALID_DATE | 400 | La fecha {campo} no es valida |
| SERVICES_NOT_ALLOWED | 400 | Los servicios adicionales solo se permiten para reservas de tipo especial |
| RESERVATION_CREATE_FAILED | 500 | No se pudo recuperar la reserva creada |
| RESERVATION_UPDATE_FAILED | 500 | No se pudo recuperar la reserva actualizada |

### Notifications
| Code | Status | Message |
| --- | --- | --- |
| NOTIFICATION_TEMPLATE_NOT_FOUND | 404 | Plantilla de notificacion no encontrada |

### Roles
| Code | Status | Message |
| --- | --- | --- |
| FORBIDDEN_ACTION | 403 | No tienes permisos para realizar esta accion |
