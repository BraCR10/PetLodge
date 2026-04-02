import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { NormalizeEncodingInterceptor } from '../../common/interceptors/normalize-encoding.interceptor';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';


@ApiTags('pets')
@ApiBearerAuth()
@UseInterceptors(NormalizeEncodingInterceptor)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Create a pet with an optional photo' })
  @ApiCreatedResponse({ description: 'Created pet' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePetDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePetDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.petsService.create(user.id, dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'List all pets for the authenticated user' })
  @ApiOkResponse({ description: 'Array of pets' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.petsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single pet by id' })
  @ApiOkResponse({ description: 'Pet detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.petsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Update any pet fields and/or replace the photo' })
  @ApiOkResponse({ description: 'Updated pet' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePetDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePetDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.petsService.update(id, user.id, dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet and its S3 photo if present' })
  @ApiNoContentResponse({ description: 'Pet deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.petsService.remove(id, user.id);
  }
}
