import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import {
  CreateCaseDto,
  UpdateCaseStatusDto,
  CaseResponseDto,
} from './dto/case.dto';

@ApiTags('Cases')
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo caso para un participante',
    description:
      'Crea un nuevo caso asociado a un participante específico. El número de caso se genera automáticamente y puede incluir toda la información médica inicial.',
  })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({
    status: 201,
    description:
      'Caso creado exitosamente con todas las entidades médicas relacionadas',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Participante no encontrado',
  })
  @HttpCode(HttpStatus.CREATED)
  async createCase(@Body() createCaseDto: CreateCaseDto) {
    return await this.casesService.createCase(createCaseDto);
  }

  @Get('participants/:participantId/cases')
  @ApiOperation({
    summary: 'Obtener todos los casos de un participante',
    description:
      'Retorna la lista de todos los casos asociados a un participante específico.',
  })
  @ApiParam({
    name: 'participantId',
    description: 'ID del participante',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de casos del participante',
    type: [CaseResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Participante no encontrado',
  })
  async findAllByParticipant(
    @Param('participantId', ParseIntPipe) participantId: number,
  ) {
    return await this.casesService.findAllByParticipant(participantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener caso por ID',
    description:
      'Retorna los detalles de un caso específico incluyendo información del participante.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del caso',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del caso',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Caso no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.casesService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar estado del caso',
    description:
      'Actualiza el estado de un caso específico. Valida transiciones de estado permitidas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del caso',
    type: Number,
  })
  @ApiBody({ type: UpdateCaseStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Estado del caso actualizado exitosamente',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado inválida',
  })
  @ApiResponse({
    status: 404,
    description: 'Caso no encontrado',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaseStatusDto: UpdateCaseStatusDto,
  ) {
    return await this.casesService.updateStatus(id, updateCaseStatusDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los casos',
    description:
      'Retorna la lista de todos los casos del sistema con información de participantes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los casos',
    type: [CaseResponseDto],
  })
  async findAll() {
    return await this.casesService.findAll();
  }
}
