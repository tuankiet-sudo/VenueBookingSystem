import {
  Controller,
  Post,
  Body,
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
import { VenueService } from '../services/venue.service';
import {
  CreateVenueDto,
  CreateVenueImageDto,
  CreateVenueTypeDto,
  UpdateVenueDto,
  UpdateVenueTypeDto,
  CreateRateDto,
  UpdateRateDto,
  RateResponseDto,
  LocationRatingsDto,
  FavorResponseDto,
} from '../dto/create-venue.dto';
import { VenuePreviewResponseDto } from '../dto/venue-preview-response.dto';
import { AdminGuard, AuthGuard, OwnerGuard } from '../../auth/guards';
import { User } from '../../auth/decorators';

@ApiTags('Venues')
@Controller('venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  // ===== VENUE TYPE ENDPOINTS =====
  @Post('/types')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new venue type (Admin only)' })
  @ApiResponse({ status: 201, description: 'Venue type created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createVenueType(@Body() dto: CreateVenueTypeDto) {
    const venueTypeId = await this.venueService.createVenueType(dto);
    return { _id: venueTypeId };
  }

  @Get('/types')
  @UseGuards(AuthGuard)
  async getVenueTypes() {
    const venueTypeId = await this.venueService.getVenueTypes();
    return { data: venueTypeId };
  }

  @Patch('/types/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update venue type (Admin only)' })
  @ApiResponse({ status: 200, description: 'Venue type updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Venue type not found' })
  async updateVenueType(
    @Param('id') id: string,
    @Body() dto: UpdateVenueTypeDto,
  ) {
    await this.venueService.updateVenueType(id, dto);
    return { message: 'Venue type updated successfully' };
  }

  @Delete('/types/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete venue type (Admin only)' })
  @ApiResponse({ status: 200, description: 'Venue type deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Venue type not found' })
  async deleteVenueType(@Param('id') id: string) {
    await this.venueService.deleteVenueType(id);
    return { message: 'Venue type deleted successfully' };
  }

  // ===== VENUE ENDPOINTS =====
  @Post()
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiResponse({ status: 201, description: 'Venue created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async createVenue(@Body() dto: CreateVenueDto) {
    await this.venueService.createVenue(dto);
    return { message: 'Venue created successfully' };
  }

  @Get('/:locationId/:name/preview')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Preview venue details' })
  @ApiResponse({
    status: 200,
    description: 'Venue preview retrieved successfully',
    type: VenuePreviewResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async previewVenue(
    @Param('locationId') locationId: string,
    @Param('name') name: string,
  ): Promise<VenuePreviewResponseDto[]> {
    const result = await this.venueService.previewVenue(locationId, name);
    return result;
  }

  @Get('/:locationId')
  @Patch('/:locationId/:name')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update venue details' })
  @ApiResponse({ status: 200, description: 'Venue updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async updateVenue(
    @Param('locationId') locationId: string,
    @Param('name') name: string,
    @Body() dto: UpdateVenueDto,
  ) {
    await this.venueService.updateVenue(locationId, name, dto);
  }

  @Delete('/:locationId/:name')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a venue' })
  @ApiResponse({ status: 200, description: 'Venue deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async deleteVenue(
    @Param('locationId') locationId: string,
    @Param('name') name: string,
  ) {
    await this.venueService.deleteVenue(locationId, name);
    return { message: 'Venue deleted successfully' };
  }

  // ===== VENUE IMAGE ENDPOINTS =====
  @Post('/images')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add an image to a venue' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async createVenueImage(@Body() dto: CreateVenueImageDto) {
    const url = await this.venueService.createVenueImage(dto);
    return { url };
  }

  @Delete('/images/:locationId/:venueName/:url')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove an image from a venue' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteVenueImage(
    @Param('locationId') locationId: string,
    @Param('venueName') venueName: string,
    @Param('url') url: string,
  ) {
    await this.venueService.deleteVenueImage(locationId, venueName, url);
    return { message: 'Venue image deleted successfully' };
  }

  // ===== RATE ENDPOINTS =====
  @Get('/rates/:locationId')
  @ApiOperation({ summary: 'Get all ratings for a location' })
  @ApiResponse({
    status: 200,
    description: 'Ratings retrieved successfully',
    type: LocationRatingsDto,
  })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getLocationRatings(@Param('locationId') locationId: string) {
    const ratings = await this.venueService.getLocationRatings(locationId);
    return ratings;
  }

  @Post('/rates')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rate a location' })
  @ApiResponse({
    status: 201,
    description: 'Rating created successfully',
    type: RateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createRate(@Body() dto: CreateRateDto) {
    await this.venueService.createRate(dto);
    return { message: 'Rating created successfully' };
  }

  @Patch('/rates/:clientId/:locationId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing rating' })
  @ApiResponse({
    status: 200,
    description: 'Rating updated successfully',
    type: RateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  async updateRate(
    @Param('clientId') clientId: string,
    @Param('locationId') locationId: string,
    @Body() dto: UpdateRateDto,
  ) {
    await this.venueService.updateRate(clientId, locationId, dto);
    return { message: 'Rating updated successfully' };
  }

  @Delete('/rates/:clientId/:locationId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  async deleteRate(
    @Param('clientId') clientId: string,
    @Param('locationId') locationId: string,
  ) {
    await this.venueService.deleteRate(clientId, locationId);
    return { message: 'Rating deleted successfully' };
  }

  // ===== FAVOR ENDPOINTS =====

  @Get('/client/rates')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all ratings by current user' })
  @ApiResponse({
    status: 200,
    description: 'User ratings retrieved successfully',
    type: [RateResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClientRates(@User() user: Express.User) {
    const ratings = await this.venueService.getClientRates(user.userId);
    return ratings;
  }

  @Get('/client/favors')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all favorited locations by current user' })
  @ApiResponse({
    status: 200,
    description: 'User favorites retrieved successfully',
    type: [FavorResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClientFavors(@User() user: Express.User) {
    const favors = await this.venueService.getClientFavors(user.userId);
    return favors;
  }
}
