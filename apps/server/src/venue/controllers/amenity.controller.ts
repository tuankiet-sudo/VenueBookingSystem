import {
  Controller,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AmenityService } from '../services/amenity.service';
import { CreateAmenityDto, UpdateAmenityDto } from '../dto/create-venue.dto';
import { OwnerGuard } from '../../auth/guards';

@ApiTags('Amenities')
@Controller('amenity')
@UseGuards(OwnerGuard)
@ApiBearerAuth('JWT-auth')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Post()
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Create a new amenity' })
  @ApiResponse({ status: 201, description: 'Amenity created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async create(@Body() dto: CreateAmenityDto) {
    await this.amenityService.createAmenity(dto);
  }

  @Get('/:locationId')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Get amenities by location ID' })
  @ApiResponse({
    status: 200,
    description: 'Amenities retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async getByLocation(@Param('locationId') locationId: string) {
    const amenities =
      await this.amenityService.getAmenitiesByLocation(locationId);
    return { data: amenities };
  }

  @Get('/:locationId/:name')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Get amenity by location ID and name' })
  @ApiResponse({
    status: 200,
    description: 'Amenity retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async getByLocationAndName(
    @Param('locationId') locationId: string,
    @Param('name') name: string,
  ) {
    const amenity = await this.amenityService.getAmenityByLocationAndName(
      locationId,
      name,
    );
    return amenity;
  }

  @Patch('/:id/:name')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Update amenity details' })
  @ApiResponse({ status: 200, description: 'Amenity updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Amenity not found' })
  async update(
    @Param('id') id: string,
    @Param('name') name: string,
    @Body() dto: UpdateAmenityDto,
  ) {
    await this.amenityService.updateAmenity(id, name, dto);
    return { message: 'Amenity updated successfully' };
  }

  @Delete('/:id/:name')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete an amenity' })
  @ApiResponse({ status: 200, description: 'Amenity deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Amenity not found' })
  async delete(@Param('id') id: string, @Param('name') name: string) {
    await this.amenityService.deleteAmenity(id, name);
    return { message: 'Amenity deleted successfully' };
  }
}
