import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { ProfileAvatarService } from './profile-avatar.service';

/** Foto de otro usuario para la lista de usuarios (solo administradores). */
@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@Controller('users/:id/avatar')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.ADMIN_COUNTRY)
export class UserAvatarController {
  constructor(private readonly service: ProfileAvatarService) {}

  @Get()
  @ApiOperation({ summary: 'Foto de un usuario (204 si no tiene)' })
  async get(
    @CurrentUser() viewer: User,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const avatar = await this.service.getForViewer(viewer, id);
    if (!avatar) {
      res.status(204).end();
      return;
    }
    res.set({
      'Content-Type': avatar.contentType,
      'Content-Length': avatar.body.length,
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(avatar.body);
  }
}
