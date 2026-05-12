import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleCountryGuard } from '../common/guards/role-country.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Catálogos - Países')
@Controller('countries')
@UseGuards(JwtAuthGuard, RoleCountryGuard)
@ApiBearerAuth()
export class CountryController {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los países' })
  @ApiResponse({ status: 200, type: [Country] })
  async findAll(): Promise<Country[]> {
    return this.countryRepo.find();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear país' })
  @ApiResponse({ status: 201, type: Country })
  async create(
    @Body() body: { name: string; iso?: string; locale?: string },
  ): Promise<Country> {
    const country = this.countryRepo.create(body);
    return this.countryRepo.save(country);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Editar país' })
  @ApiResponse({ status: 200, type: Country })
  async update(
    @Param('id') id: number,
    @Body() body: { name?: string; iso?: string; locale?: string },
  ): Promise<Country> {
    await this.countryRepo.update(id, body);
    return this.countryRepo.findOneByOrFail({ id });
  }
}
