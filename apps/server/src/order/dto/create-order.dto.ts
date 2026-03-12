import { IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  locationId: string; // venue_loc_id

  @IsNotEmpty()
  venueName: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string; // DATETIME

  @IsNotEmpty()
  @IsDateString()
  endTime: string; // DATETIME

  @IsOptional()
  amenityIds?: string[]; // Used for order_amenities
}
