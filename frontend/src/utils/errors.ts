const CODE_FALLBACK_MESSAGES: Record<string, string> = {
  BAD_REQUEST: 'Solicitud invalida',
  VALIDATION_ERROR: 'Datos invalidos',
  UNAUTHORIZED: 'No autenticado',
  FORBIDDEN: 'No tienes permisos para realizar esta accion',
  NOT_FOUND: 'Recurso no encontrado',
  CONFLICT: 'Conflicto de datos',
  PAYLOAD_TOO_LARGE: 'La solicitud es demasiado grande',
  UNSUPPORTED_MEDIA_TYPE: 'Tipo de contenido no soportado',
  TOO_MANY_REQUESTS: 'Demasiadas solicitudes',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  SERVICE_UNAVAILABLE: 'Servicio no disponible',
};

export const getFriendlyErrorMessage = (err: any, fallbackMessage: string): string => {
  const responseData = err?.response?.data;
  if (responseData) {
    if (Array.isArray(responseData.details) && responseData.details.length > 0) {
      return responseData.details.join(', ');
    }
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
    if (typeof responseData.code === 'string') {
      const mapped = CODE_FALLBACK_MESSAGES[responseData.code];
      if (mapped) return mapped;
    }
  }

  const genericMessage = 'Ocurrio un problema. Intenta de nuevo.';
  const rawMessage = typeof err === 'string' ? err : (err?.message || '');
  if (!rawMessage) return fallbackMessage || genericMessage;

  const msgLower = rawMessage.toLowerCase();
  if (msgLower.includes('network error') || msgLower.includes('failed to fetch')) {
    return 'Problema de conexion. Verifica tu internet y vuelve a intentar.';
  }
  if (msgLower.includes('timeout')) {
    return 'No pudimos conectarnos a tiempo. Vuelve a intentar.';
  }

  return fallbackMessage || genericMessage;
};
