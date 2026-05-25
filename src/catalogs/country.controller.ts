import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@ApiTags('Catálogos - Países')
@Controller('countries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CountryController {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar países activos (público)' })
  @ApiResponse({ status: 200, type: [Country] })
  async findAll(): Promise<Country[]> {
    return this.countryRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  @Public()
  @Get(':iso')
  @ApiOperation({ summary: 'Obtener país por código ISO' })
  @ApiParam({
    name: 'iso',
    example: 'CO',
    description: 'Código ISO 2 caracteres',
  })
  @ApiResponse({ status: 200, type: Country })
  @ApiResponse({ status: 404, description: 'País no encontrado' })
  async findByIso(@Param('iso') iso: string): Promise<Country> {
    const country = await this.countryRepo.findOne({
      where: { iso: iso.toUpperCase(), isActive: true },
    });
    if (!country) {
      throw new NotFoundException(`País con ISO "${iso}" no encontrado`);
    }
    return country;
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear país (solo ADMIN)' })
  @ApiResponse({ status: 201, type: Country })
  async create(@Body() body: CreateCountryDto): Promise<Country> {
    const country = this.countryRepo.create(body);
    return this.countryRepo.save(country);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar país (solo ADMIN)' })
  @ApiResponse({ status: 200, type: Country })
  async update(
    @Param('id') id: number,
    @Body() body: UpdateCountryDto,
  ): Promise<Country> {
    await this.countryRepo.update(id, body);
    return this.countryRepo.findOneByOrFail({ id });
  }
}
