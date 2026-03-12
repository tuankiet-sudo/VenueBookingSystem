import { ApiProperty } from '@nestjs/swagger';

export class ClientOrderResponseDto {
  @ApiProperty({
    example: 'order-uuid-here',
    description: 'Order ID',
  })
  order_id: string;

  @ApiProperty({
    example: 'CONFIRMED',
    description: 'Order status',
    enum: ['DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
  })
  status: string;

  @ApiProperty({
    example: 500000,
    description: 'Total price in VND',
  })
  totalPrice: number;

  @ApiProperty({
    example: 50,
    description: 'Loyalty points earned',
  })
  points: number;

  @ApiProperty({
    example: '2024-12-10T09:00:00Z',
    description: 'Booking start time',
  })
  startHour: string;

  @ApiProperty({
    example: '2024-12-10T17:00:00Z',
    description: 'Booking end time',
  })
  endHour: string;

  @ApiProperty({
    example: '2024-12-01T10:30:00Z',
    description: 'When the order was created',
  })
  booking_created_at: string;

  @ApiProperty({
    example: 'Conference Room A',
    description: 'Venue name',
  })
  venue_name: string;

  @ApiProperty({
    example: '3',
    description: 'Floor number',
  })
  floor: string;

  @ApiProperty({
    example: 150000,
    description: 'Price per hour in VND',
  })
  pricePerHour: number;

  @ApiProperty({
    example: 'Luxury',
    description: 'Venue theme/type name',
  })
  venue_theme: string;

  @ApiProperty({
    example: 10,
    description: 'Minimum capacity',
  })
  minCapacity: number;

  @ApiProperty({
    example: 50,
    description: 'Maximum capacity',
  })
  maxCapacity: number;

  @ApiProperty({
    example: 'Sky Garden Event Space',
    description: 'Location name',
  })
  location_name: string;

  @ApiProperty({
    example: '123',
    description: 'Address number',
  })
  addrNo: string;

  @ApiProperty({
    example: 'Ben Nghe',
    description: 'Ward/District',
  })
  ward: string;

  @ApiProperty({
    example: 'Ho Chi Minh City',
    description: 'City',
  })
  city: string;

  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
    description: 'Location thumbnail URL',
  })
  thumbnailURL: string;
}

export class InvoiceCreateDataResponseDto {
  @ApiProperty({
    example: 500000,
    description: 'Total price of the order in VND',
  })
  totalPrice: number;

  @ApiProperty({
    example: 'owner-uuid-here',
    description: 'Owner user ID',
  })
  owner_id: string;

  @ApiProperty({
    example: 'VCB',
    description: 'Bank ID code',
  })
  bankId: string;

  @ApiProperty({
    example: 'Vietcombank',
    description: 'Bank name',
  })
  bankName: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Account holder name',
  })
  accountName: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Bank account number',
  })
  accountNo: string;
}

export class GetClientOrdersQueryDto {
  @ApiProperty({
    example: 'CONFIRMED',
    description: 'Filter by order status (optional)',
    required: false,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
  })
  status?: string;
}
