import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios activos',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('all/with-deleted')
  @ApiOperation({ summary: 'Obtener todos los usuarios incluyendo eliminados' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de usuarios',
  })
  findAllWithDeleted() {
    return this.usersService.findAllWithDeleted();
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar usuario eliminado' })
  @ApiResponse({
    status: 200,
    description: 'Usuario restaurado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario eliminado no encontrado',
  })
  restore(@Param('id') id: string) {
    return this.usersService.restore(+id);
  }
}
