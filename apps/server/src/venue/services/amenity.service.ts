import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateAmenityDto, UpdateAmenityDto } from '../dto/create-venue.dto';

@Injectable()
export class AmenityService {
  constructor(private databaseService: DatabaseService) {}

  public async createAmenity(dto: CreateAmenityDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Amenity_Insert(?, ?, ?, ?, ?)`, [
        dto.locationId,
        dto.name,
        dto.category,
        dto.description || null,
        dto.price,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create amenity');
    }
  }

  public async updateAmenity(
    id: string,
    name: string,
    dto: UpdateAmenityDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL Amenity_Update(?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          dto.name || null,
          name,
          dto.category || null,
          dto.description || null,
          dto.price !== undefined ? dto.price : null,
          dto.isActive !== undefined ? dto.isActive : null,
        ],
      );
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to update amenity');
    }
  }

  public async deleteAmenity(id: string, name: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Amenity_Delete(?, ?)`, [
        id,
        name,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete amenity');
    }
  }

  public async getAmenitiesByLocation(locationId: string) {
    return await this.databaseService.execute(`CALL Filter_Amenities(?, ?)`, [
      locationId,
      null,
    ]);
  }

  public async getAmenityByLocationAndName(locationId: string, name: string) {
    const result = await this.databaseService.execute(
      `CALL Get_Amenity_Details(?, ?)`,
      [locationId, name],
    );
    if (result.length === 0) {
      throw new ConflictException('Amenity not found');
    }
    return result[0];
  }
}
