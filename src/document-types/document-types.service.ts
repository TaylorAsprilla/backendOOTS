import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';

@Injectable()
export class DocumentTypesService {
  private readonly logger = new Logger(DocumentTypesService.name);

  constructor(
    @InjectRepository(DocumentType)
    private readonly documentTypeRepository: Repository<DocumentType>,
  ) {}

  /**
   * Crear un nuevo tipo de documento
   */
  async create(
    createDocumentTypeDto: CreateDocumentTypeDto,
  ): Promise<DocumentType> {
    try {
      // Verificar si ya existe un tipo de documento con el mismo nombre
      const existingByName = await this.documentTypeRepository.findOne({
        where: { name: createDocumentTypeDto.name },
      });

      if (existingByName) {
        throw new ConflictException(
          `Ya existe un tipo de documento con el nombre "${createDocumentTypeDto.name}"`,
        );
      }

      const documentType = this.documentTypeRepository.create(
        createDocumentTypeDto,
      );
      const savedDocumentType =
        await this.documentTypeRepository.save(documentType);

      this.logger.log(
        `Tipo de documento creado: ${savedDocumentType.id} - ${savedDocumentType.name}`,
      );

      return savedDocumentType;
    } catch (error) {
      this.logger.error('Error al crear tipo de documento:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tipos de documento
   */
  async findAll(): Promise<DocumentType[]> {
    return this.documentTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener solo los tipos de documento activos
   */
  async findActive(): Promise<DocumentType[]> {
    return this.documentTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Obtener un tipo de documento por ID
   */
  async findOne(id: number): Promise<DocumentType> {
    const documentType = await this.documentTypeRepository.findOne({
      where: { id },
    });

    if (!documentType) {
      throw new NotFoundException(
        `Tipo de documento con ID ${id} no encontrado`,
      );
    }

    return documentType;
  }

  /**
   * Actualizar un tipo de documento
   */
  async update(
    id: number,
    updateDocumentTypeDto: UpdateDocumentTypeDto,
  ): Promise<DocumentType> {
    try {
      const documentType = await this.findOne(id);

      // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
      if (
        updateDocumentTypeDto.name &&
        updateDocumentTypeDto.name !== documentType.name
      ) {
        const existingByName = await this.documentTypeRepository.findOne({
          where: { name: updateDocumentTypeDto.name },
        });

        if (existingByName) {
          throw new ConflictException(
            `Ya existe un tipo de documento con el nombre "${updateDocumentTypeDto.name}"`,
          );
        }
      }

      Object.assign(documentType, updateDocumentTypeDto);
      const updatedDocumentType =
        await this.documentTypeRepository.save(documentType);

      this.logger.log(
        `Tipo de documento actualizado: ${updatedDocumentType.id} - ${updatedDocumentType.name}`,
      );

      return updatedDocumentType;
    } catch (error) {
      this.logger.error(`Error al actualizar tipo de documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de documento (soft delete - cambiar isActive a false)
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const documentType = await this.findOne(id);

      documentType.isActive = false;
      await this.documentTypeRepository.save(documentType);

      this.logger.log(
        `Tipo de documento desactivado: ${documentType.id} - ${documentType.name}`,
      );

      return {
        message: `Tipo de documento "${documentType.name}" desactivado exitosamente`,
      };
    } catch (error) {
      this.logger.error(`Error al desactivar tipo de documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reactivar un tipo de documento
   */
  async activate(id: number): Promise<DocumentType> {
    try {
      const documentType = await this.findOne(id);

      documentType.isActive = true;
      const activatedDocumentType =
        await this.documentTypeRepository.save(documentType);

      this.logger.log(
        `Tipo de documento activado: ${activatedDocumentType.id} - ${activatedDocumentType.name}`,
      );

      return activatedDocumentType;
    } catch (error) {
      this.logger.error(`Error al activar tipo de documento ${id}:`, error);
      throw error;
    }
  }
}
