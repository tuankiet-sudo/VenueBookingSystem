import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  CreateLocationDto,
  SearchLocationsDto,
  UpdateLocationDto,
  LocationDetailsResponseDto,
  LocationListItemDto,
  AdminOwnerFeesResponseDto,
} from '../dto/create-venue.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LocationService {
  constructor(private databaseService: DatabaseService) {}

  public async createLocation(
    ownerId: string,
    dto: CreateLocationDto,
  ): Promise<string> {
    const locationId = randomUUID();

    try {
      await this.databaseService.execute(
        `CALL Location_Insert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          locationId,
          ownerId,
          dto.name,
          dto.description || null,
          dto.addrNo,
          dto.ward,
          dto.city,
          dto.phoneNo || null,
          dto.policy || null,
          dto.mapURL,
          dto.thumbnailURL,
        ],
      );
      return locationId;
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create location');
    }
  }

  public async updateLocation(
    id: string,
    dto: UpdateLocationDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL Location_Update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          dto.name || null,
          dto.description || null,
          dto.addrNo || null,
          dto.ward || null,
          dto.city || null,
          dto.phoneNo || null,
          dto.policy || null,
          dto.mapURL || null,
          dto.thumbnailURL || null,
          dto.isActive !== undefined ? dto.isActive : null,
        ],
      );
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to update location');
    }
  }

  public async deleteLocation(id: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Location_Delete(?)`, [id]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete location');
    }
  }

  // ===== SEARCH LOCATIONS OPERATION =====
  public async searchLocations(
    clientId: string | null,
    dto: SearchLocationsDto,
  ): Promise<any[]> {
    try {
      const result = await this.databaseService.execute<any>(
        `CALL getListLocations(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dto.city,
          dto.startTime ? new Date(dto.startTime) : null,
          dto.endTime ? new Date(dto.endTime) : null,
          dto.minPrice || null,
          dto.maxPrice || null,
          dto.minAvgRating || null,
          dto.theme || null,
          dto.size || null,
          dto.amenityCategory || null,
          dto.sort || null,
          clientId,
        ],
      );

      // Transform image_urls from comma-separated string to array
      return result.map((location: any) => ({
        ...location,
        image_urls: location.image_urls
          ? location.image_urls.split(',').map((url: string) => url.trim())
          : [],
      }));
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to search locations',
      );
    }
  }

  public async getLocationsOfOwner(userId: string) {
    console.log(userId);
    try {
      const result = await this.databaseService.execute<any>(
        `CALL listLocationOfOwner(?)`,
        [userId],
      );
      return result;
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to search locations',
      );
    }
  }

  public async previewLocation(userid: string, id: string): Promise<any> {
    try {
      const result = await this.databaseService.execute<any>(
        `CALL getLocationDetailById(?, ?)`,
        [userid, id],
      );
      return result[0];
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to preview location',
      );
    }
  }

  public async getVenuesAtLocation(id: string) {
    try {
      const raw = await this.databaseService.execute<any>(
        `CALL listVenueOfLocation(?)`,
        [id],
      );
      const result = raw.map((venue) => ({
        ...venue,
        venueImageURLs: venue.venueImageURLs.split(','),
      }));
      return result;
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get location detail',
      );
    }
  }

  // ===== GET LOCATION DETAILS BY ID =====
  public async getLocationDetailsById(
    locationId: string,
    clientId: string | null,
  ): Promise<LocationDetailsResponseDto> {
    try {
      // Use getConnection to execute stored procedure that returns multiple result sets
      const connection = await this.databaseService.getConnection();

      try {
        const [results] = await connection.query(
          `CALL getLocationDetailsById(?, ?)`,
          [locationId, clientId],
        );

        // The stored procedure returns 6 result sets:
        // [0] = Location basic info
        // [1] = Venues list
        // [2] = Venue images
        // [3] = Amenities
        // [4] = Reviews
        // [5] = Rating statistics

        return {
          location: results[0][0] || null,
          venues: results[1] || [],
          images: results[2] || [],
          amenities: results[3] || [],
          reviews: results[4] || [],
          statistics: results[5][0] || {
            total_ratings: 0,
            avg_rating: 0,
            five_stars: 0,
            four_stars: 0,
            three_stars: 0,
            two_stars: 0,
            one_star: 0,
          },
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get location details',
      );
    }
  }

  // ===== GET ALL LOCATIONS =====
  public async getAllLocations(
    clientId: string | null,
  ): Promise<LocationListItemDto[]> {
    try {
      const result = await this.databaseService.execute<any>(
        `CALL getAllLocations(?)`,
        [clientId],
      );

      // result is already an array of rows from the stored procedure
      return result || [];
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get all locations',
      );
    }
  }

  // ===== FAVOR OPERATIONS =====
  public async createFavor(
    clientId: string,
    locationId: string,
  ): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Favor_Insert(?, ?)`, [
        clientId,
        locationId,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create favor');
    }
  }

  public async deleteFavor(
    clientId: string,
    locationId: string,
  ): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Favor_Delete(?, ?)`, [
        clientId,
        locationId,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete favor');
    }
  }

  // ===== ADMIN OPERATIONS =====
  public async getOwnerFees(
    month: number,
    year: number,
  ): Promise<AdminOwnerFeesResponseDto[]> {
    try {
      const result = await this.databaseService.execute<any>(
        `CALL Admin_ManageOwnerFees(?, ?)`,
        [month, year],
      );

      return result || [];
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to get owner fees');
    }
  }
}
