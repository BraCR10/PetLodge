import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

// Maps Latin-1 mojibake sequences back to the correct UTF-8 Spanish characters.
// Swagger UI (and some HTTP clients) send multipart field names and values encoded
// as Latin-1, turning e.g. `ñ` (0xC3 0xB1) into the two-character sequence `Ã±`.
const ENCODING_MAP: Record<string, string> = {
  // Minúsculas
  '\xC3\xA1': 'á',
  '\xC3\xA9': 'é',
  '\xC3\xAD': 'í',
  '\xC3\xB3': 'ó',
  '\xC3\xBA': 'ú',
  '\xC3\xB1': 'ñ',
  '\xC3\xBC': 'ü',
  // Mayúsculas
  '\xC3\x81': 'Á',
  '\xC3\x89': 'É',
  '\xC3\x8D': 'Í',
  '\xC3\x93': 'Ó',
  '\xC3\x9A': 'Ú',
  '\xC3\x91': 'Ñ',
  '\xC3\x9C': 'Ü',
};

// Maps accented field names to their ASCII-safe DTO equivalents so both
// the correct UTF-8 form (`tamaño`) and the API form (`tamano`) are accepted.
const FIELD_NAME_MAP: Record<string, string> = {
  tamaño: 'tamano',
};

const ENCODING_PATTERN = new RegExp(Object.keys(ENCODING_MAP).join('|'), 'g');

function fixString(str: string): string {
  return str.replace(ENCODING_PATTERN, (match) => ENCODING_MAP[match] ?? match);
}

function fixBody(body: unknown): unknown {
  if (typeof body !== 'object' || body === null) return body;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const decodedKey = fixString(key);
    const normalizedKey = FIELD_NAME_MAP[decodedKey] ?? decodedKey;
    result[normalizedKey] = typeof value === 'string' ? fixString(value) : value;
  }
  return result;
}

@Injectable()
export class NormalizeEncodingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ body: unknown }>();
    if (req.body && typeof req.body === 'object') {
      req.body = fixBody(req.body);
    }
    return next.handle();
  }
}
