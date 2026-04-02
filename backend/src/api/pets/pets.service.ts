import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pet } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

// Replaces the accent-stripped DB column `tamano` with `tamaño` to match the frontend Mascota type.
// Excludes `userId` (internal relation key) and normalises `foto` to always be a string.
type PetResponse = Omit<Pet, 'tamano' | 'userId' | 'foto'> & { tamaño: string; foto: string };

@Injectable()
export class PetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {}

  async create(
    userId: string,
    dto: CreatePetDto,
    file?: Express.Multer.File,
  ): Promise<PetResponse> {
    // Strip `foto` from the DTO — the file upload is handled by FileInterceptor, not the body.
    const { foto: _foto, ...fields } = dto;

    // Upload the photo before inserting so the record is created with the final URL.
    let fotoUrl: string | undefined;
    if (file) {
      fotoUrl = await this.storage.upload(file.buffer, file.mimetype, file.originalname);
    }

    const pet = await this.prisma.pet.create({
      data: {
        ...fields,
        condicionesMedicas: fields.condicionesMedicas ?? '',
        numeroVeterinario: fields.numeroVeterinario ?? '',
        cuidadosEspeciales: fields.cuidadosEspeciales ?? '',
        foto: fotoUrl,
        userId,
      },
    });

    return this.toResponse(pet);
  }

  async findAll(userId: string): Promise<PetResponse[]> {
    const pets = await this.prisma.pet.findMany({ where: { userId, isActive: true } });
    return pets.map((p) => this.toResponse(p));
  }

  async findOne(id: string, userId: string): Promise<PetResponse> {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('Mascota no encontrada');
    if (pet.userId !== userId) throw new ForbiddenException();
    return this.toResponse(pet);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePetDto,
    file?: Express.Multer.File,
  ): Promise<PetResponse> {
    const existing = await this.assertOwnership(id, userId);

    // Strip `foto` from the DTO — the file upload is handled by FileInterceptor, not the body.
    const { foto: _foto, ...fields } = dto;

    // If a new photo is provided, replace the old S3 object before writing to DB.
    let fotoUrl: string | undefined;
    if (file) {
      if (existing.foto) {
        await this.storage.delete(this.storage.keyFromUrl(existing.foto));
      }
      fotoUrl = await this.storage.upload(file.buffer, file.mimetype, file.originalname);
    }

    const pet = await this.prisma.pet.update({
      where: { id },
      data: {
        ...fields,
        ...(fotoUrl !== undefined && { foto: fotoUrl }),
      },
    });

    return this.toResponse(pet);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);
    await this.prisma.pet.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Verifies ownership and returns the raw Pet record (needed for foto/tamano before mapping).
  private async assertOwnership(id: string, userId: string): Promise<Pet> {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || !pet.isActive) throw new NotFoundException('Mascota no encontrada');
    if (pet.userId !== userId) throw new ForbiddenException();
    return pet;
  }

  private toResponse(pet: Pet): PetResponse {
    const { tamano, userId: _userId, foto, ...rest } = pet;

    const fotoFinal =
      foto ?? `${this.config.getOrThrow<string>('AVATAR_API')}${encodeURIComponent(rest.nombre)}`;

    return { ...rest, tamaño: tamano, foto: fotoFinal };
  }
}
