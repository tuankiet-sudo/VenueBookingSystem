import { Module } from '@nestjs/common';
import { VenueService } from './services/venue.service';
import { VenueController } from './controllers/venue.controller';
import { LocationController } from './controllers/location.controller';
import { AmenityController } from './controllers/amenity.controller';
import { AmenityService } from './services/amenity.service';
import { LocationService } from './services/location.service';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [VenueController, LocationController, AmenityController],
  providers: [VenueService, AmenityService, LocationService],
})
export class VenueModule {}
