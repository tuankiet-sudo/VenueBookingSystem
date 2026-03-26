import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateVenueDto,
  CreateVenueImageDto,
  CreateVenueTypeDto,
  UpdateVenueDto,
  UpdateVenueTypeDto,
  CreateRateDto,
  UpdateRateDto,
  LocationRatingsDto,
  RateResponseDto,
} from '../dto/create-venue.dto';
import { VenuePreviewResponseDto } from '../dto/venue-preview-response.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class VenueService {
  constructor(private databaseService: DatabaseService) {}

  // ===== VENUE TYPE OPERATIONS =====
  public async createVenueType(dto: CreateVenueTypeDto): Promise<string> {
    const { v4: uuidv4 } = await import('uuid');
    if (dto.minCapacity > dto.maxCapacity) {
      throw new BadRequestException(
        'Minimum capacity cannot be greater than maximum capacity.',
      );
    }

    const venueTypeId = uuidv4();

    try {
      await this.databaseService.execute(
        `CALL VenueType_Insert(?, ?, ?, ?, ?)`,
        [
          venueTypeId,
          dto.name,
          dto.description || null,
          dto.minCapacity,
          dto.maxCapacity,
        ],
      );
      return venueTypeId;
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to create venue type',
      );
    }
  }

  public async getVenueTypes() {
    return await this.databaseService.execute(`CALL GetVenueTypesInfo()`);
  }

  public async updateVenueType(
    id: string,
    dto: UpdateVenueTypeDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL VenueType_Update(?, ?, ?, ?, ?)`,
        [
          id,
          dto.name || null,
          dto.description || null,
          dto.minCapacity || null,
          dto.maxCapacity || null,
        ],
      );
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to update venue type',
      );
    }
  }

  public async deleteVenueType(id: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL VenueType_Delete(?)`, [id]);
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to delete venue type',
      );
    }
  }

  // ===== VENUE OPERATIONS =====
  public async createVenue(dto: CreateVenueDto): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL Venue_Insert(?, ?, ?, ?, ?, ?)`,
        [
          dto.locationId,
          dto.name,
          dto.venueTypeId,
          dto.floor,
          dto.area,
          dto.pricePerHour,
        ],
      );
      for (const url of dto.images) {
        await this.databaseService.execute(`CALL VenueImage_Insert(?, ?, ?)`, [
          dto.locationId,
          dto.name,
          url,
        ]);
      }
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create venue');
    }
  }

  public async updateVenue(
    locationId: string,
    name: string,
    dto: UpdateVenueDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL Venue_Update(?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          locationId,
          name,
          dto.name || null,
          dto.typeId || null,
          dto.floor || null,
          dto.area || null,
          dto.pricePerHour || null,
          dto.isActive !== undefined ? dto.isActive : null,
        ],
      );
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to update venue');
    }
  }

  public async previewVenue(
    locationId: string,
    name: string,
  ): Promise<VenuePreviewResponseDto[]> {
    try {
      const [results] = await this.databaseService.execute(
        `CALL Venue_Preview(?, ?)`,
        [locationId, name],
      );
      return results as VenuePreviewResponseDto[];
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to preview venue');
    }
  }

  public async deleteVenue(locationId: string, name: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Venue_Delete(?, ?)`, [
        locationId,
        name,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete venue');
    }
  }

  // ===== VENUE IMAGE OPERATIONS =====
  public async createVenueImage(dto: CreateVenueImageDto): Promise<string> {
    try {
      await this.databaseService.execute(`CALL VenueImage_Insert(?, ?, ?)`, [
        dto.locationId,
        dto.venueName,
        dto.url,
      ]);
      return dto.url; // Return the URL as identifier
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to create venue image',
      );
    }
  }

  public async deleteVenueImage(
    locationId: string,
    venueName: string,
    url: string,
  ): Promise<void> {
    try {
      await this.databaseService.execute(`CALL VenueImage_Delete(?, ?, ?)`, [
        locationId,
        venueName,
        url,
      ]);
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to delete venue image',
      );
    }
  }

  // ===== RATE OPERATIONS =====
  public async createRate(dto: CreateRateDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Rate_Insert(?, ?, ?, ?)`, [
        dto.clientId,
        dto.locationId,
        dto.stars,
        dto.comment || null,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create rate');
    }
  }

  public async updateRate(
    clientId: string,
    locationId: string,
    dto: UpdateRateDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Rate_Update(?, ?, ?, ?)`, [
        clientId,
        locationId,
        dto.stars || null,
        dto.comment || null,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to update rate');
    }
  }

  public async deleteRate(clientId: string, locationId: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Rate_Delete(?, ?)`, [
        clientId,
        locationId,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete rate');
    }
  }

  public async getLocationRatings(
    locationId: string,
  ): Promise<LocationRatingsDto> {
    try {
      // Call stored procedure to fetch all ratings for the location
      const result = await this.databaseService.execute(
        `CALL getLocationRatings(?)`,
        [locationId],
      );

      const ratings: RateResponseDto[] = result.map((row: any) => ({
        clientId: row.clientId,
        locationId: row.locationId,
        stars: row.stars,
        comment: row.comment || undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt || undefined,
        clientName: row.clientName,
        avatarURL: row.avatarURL || undefined,
      }));

      // Calculate average rating
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
          : 0;

      return {
        locationId,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        totalRatings: ratings.length,
        ratings,
      };
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get location ratings',
      );
    }
  }
  public async getClientFavors(clientId: string): Promise<any[]> {
    try {
      const result = await this.databaseService.execute(
        `CALL getClientFavors(?)`,
        [clientId],
      );
      return result || [];
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get client favors',
      );
    }
  }

  public async getClientRates(clientId: string): Promise<RateResponseDto[]> {
    try {
      const result = await this.databaseService.execute(
        `CALL getClientRates(?)`,
        [clientId],
      );

      return (result || []).map((row: any) => ({
        clientId: row.clientId,
        locationId: row.locationId,
        stars: row.stars,
        comment: row.comment || undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt || undefined,
        clientName: '', // Not needed when fetching own ratings
        locationName: row.locationName,
        city: row.city,
        thumbnailURL: row.thumbnailURL,
      }));
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get client rates',
      );
    }
  }

  // ===== AMENITY OPERATIONS =====
  // Amenity operations are handled by AmenityService
}
