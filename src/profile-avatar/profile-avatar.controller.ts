import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ProfileAvatarService } from './profile-avatar.service';

/**
 * Foto de perfil. Cada usuario administra solo la suya: el identificador sale
 * siempre del token, nunca de la URL ni del cuerpo.
 */
@ApiTags('Perfil')
@ApiBearerAuth('access-token')
@Controller('auth/profile/avatar')
export class ProfileAvatarController {
  constructor(private readonly service: ProfileAvatarService) {}

  @Put()
  @ApiOperation({
    summary: 'Cambiar mi foto de perfil (JPG, PNG o WebP, máx. 2 MB)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 3 * 1024 * 1024, files: 1 },
    }),
  )
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return await this.service.upload(user.id, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Descargar mi foto de perfil (204 si no tiene)',
  })
  async get(@CurrentUser() user: User, @Res() res: Response) {
    const avatar = await this.service.get(user.id);
    if (!avatar) {
      // Sin foto: 204 (no es un error; evita ruido en la consola del navegador)
      res.status(204).end();
      return;
    }
    const { body, contentType } = avatar;
    res.set({
      'Content-Type': contentType,
      'Content-Length': body.length,
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(body);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Saber si tengo foto y si ya vi la guía para ponerla',
  })
  async status(@CurrentUser() user: User) {
    return await this.service.status(user.id);
  }

  @Put('tour-seen')
  @HttpCode(204)
  @ApiOperation({ summary: 'Marcar la guía de la foto de perfil como vista' })
  async tourSeen(@CurrentUser() user: User) {
    await this.service.markTourSeen(user.id);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Quitar mi foto de perfil' })
  async remove(@CurrentUser() user: User) {
    await this.service.remove(user.id);
  }
}
