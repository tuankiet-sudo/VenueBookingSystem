import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: '30303030-3030-3030-3030-303030303001',
    description: 'Client user ID',
  })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @ApiProperty({
    example: '40404040-4040-4040-4040-404040404001',
    description: 'Location ID where the venue is located',
  })
  @IsNotEmpty()
  @IsString()
  locationId: string;

  @ApiProperty({
    example: 'Conference Room A',
    description: 'Name of the venue to book',
  })
  @IsNotEmpty()
  @IsString()
  venueName: string;

  @ApiProperty({
    example: '2024-12-10T09:00:00Z',
    description: 'Booking start time (ISO 8601 format)',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: '2024-12-10T17:00:00Z',
    description: 'Booking end time (ISO 8601 format)',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    example: ['Projector 1', 'Sound System A'],
    description: 'Optional array of amenity NAMES to add to the order',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  amenityIds?: string[]; // Changed from amenityIds to match DB schema

  @ApiProperty({
    example: ['discount-uuid-1'],
    description: 'Optional array of discount code IDs to apply',
    required: false,
    type: [String],
  })
  @IsOptional()
  discountIds?: string[];
}

export class UpdateOrderDto {
  @ApiProperty({
    example: 500000,
    description: 'Total price of the order in VND',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiProperty({
    example: 100,
    description: 'Loyalty points earned from this order',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiProperty({
    example: 'CONFIRMED',
    description:
      'Order status (DRAFT, PENDING, CONFIRMED, CANCELLED, COMPLETED)',
    required: false,
    enum: ['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
  })
  @IsOptional()
  @IsString()
  status?: string; // 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
}

export class AddOrderAmenityDto {
  @ApiProperty({
    example: 'order-uuid-here',
    description: 'Order ID to add amenity to',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    example: 'Projector 1',
    description: 'Amenity NAME to add to the order',
  })
  @IsNotEmpty()
  @IsString()
  amenityName: string;
}

export class RemoveOrderAmenityDto {
  @ApiProperty({
    example: 'order-uuid-here',
    description: 'Order ID to remove amenity from',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    example: 'Projector 1',
    description: 'Amenity NAME to remove from the order',
  })
  @IsNotEmpty()
  @IsString()
  amenityName: string;
}
