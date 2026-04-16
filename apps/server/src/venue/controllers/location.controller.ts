import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard, OwnerGuard, AdminGuard } from '../../auth/guards';
import {
  CreateLocationDto,
  SearchLocationsDto,
  UpdateLocationDto,
  LocationSearchResultDto,
  LocationDetailsResponseDto,
  LocationListItemDto,
  AdminOwnerFeesQueryDto,
  AdminOwnerFeesResponseDto,
} from '../dto/create-venue.dto';
import { User } from '../../auth/decorators';
import { LocationService } from '../services/location.service';

@ApiTags('Locations')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ===== GET ALL LOCATIONS ENDPOINT =====
  @Get()
  @ApiOperation({ summary: 'Get all active locations (public)' })
  @ApiResponse({
    status: 200,
    description: 'Locations retrieved successfully',
    type: [LocationListItemDto],
  })
  async getAllLocations(@User() user?: Express.User) {
    // If user is authenticated, pass their ID to check favorites
    // Otherwise pass null for public access
    const clientId = user?.userId || null;
    const result = await this.locationService.getAllLocations(clientId);
    return result;
  }

  @Post()
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async create(@Body() dto: CreateLocationDto, @User() user: Express.User) {
    const locationId = await this.locationService.createLocation(
      user.userId,
      dto,
    );
    return { _id: locationId };
  }

  // ===== GET LOCATIONS OF OWNER ENDPOINT =====
  @Get('owner')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all locations owned by current user' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async getLocationsOfOwner(@User() user: Express.User) {
    const result = await this.locationService.getLocationsOfOwner(user.userId);
    return result;
  }

  // ===== SEARCH LOCATIONS ENDPOINT =====
  @Post('search')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Search for available locations with filters' })
  @ApiResponse({
    status: 200,
    description: 'Search results returned successfully',
    type: [LocationSearchResultDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchLocations(
    @Body() dto: SearchLocationsDto,
    @User() user: Express.User,
  ) {
    const results = await this.locationService.searchLocations(
      user.userId,
      dto,
    );
    return results;
  }

  // ===== PUBLIC LOCATION DETAILS ENDPOINT =====
  @Get(':id')
  @ApiOperation({ summary: 'Get complete location details by ID (public)' })
  @ApiResponse({
    status: 200,
    description: 'Location details retrieved successfully',
    type: LocationDetailsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getLocationDetails(
    @Param('id') id: string,
    @User() user?: Express.User,
  ) {
    // If user is authenticated, pass their ID to check favorites
    // Otherwise pass null for public access
    const clientId = user?.userId || null;
    const result = await this.locationService.getLocationDetailsById(
      id,
      clientId,
    );
    return result;
  }

  @Get(':id/details')
  @UseGuards(OwnerGuard)
  async previewLocation(@Param('id') id: string, @User() user: Express.User) {
    const result = await this.locationService.previewLocation(user.userId, id);
    return result;
  }

  @Get(':id/venues')
  @UseGuards(OwnerGuard)
  async getVenuesAtLocation(@Param('id') id: string) {
    const result = await this.locationService.getVenuesAtLocation(id);
    return result;
  }

  @Patch(':id')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update location details' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    await this.locationService.updateLocation(id, dto);
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async delete(@Param('id') id: string) {
    await this.locationService.deleteLocation(id);
    return { message: 'Location deleted successfully' };
  }

  // ===== FAVOR ENDPOINTS =====
  @Post(':locationId/favors')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add location to favorites' })
  @ApiResponse({ status: 201, description: 'Favorite added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createFavor(
    @Param('locationId') locationId: string,
    @User() user: Express.User,
  ) {
    await this.locationService.createFavor(user.userId, locationId);
  }

  @Delete(':locationId/favors')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove location from favorites' })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async deleteFavor(
    @Param('locationId') locationId: string,
    @User() user: Express.User,
  ) {
    await this.locationService.deleteFavor(user.userId, locationId);
  }

  // ===== ADMIN ENDPOINTS =====
  @Post('admin/owner-fees')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get owner fees statistics by month/year (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Owner fees retrieved successfully',
    type: [AdminOwnerFeesResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getOwnerFees(@Body() dto: AdminOwnerFeesQueryDto) {
    const result = await this.locationService.getOwnerFees(dto.month, dto.year);
    return result;
  }
}
