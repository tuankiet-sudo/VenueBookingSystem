import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

// ===== INVOICE DTOs =====
export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class CompleteInvoicePaymentDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  senderBank?: string;

  @IsOptional()
  @IsString()
  receiverBank?: string;

  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateInvoiceStatusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  status: string; // 'PENDING', 'SUCCEEDED', 'FAILED'

  @IsOptional()
  @IsString()
  description?: string;
}

// ===== DISCOUNT DTOs =====
export class CreateDiscountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsString()
  venueTypeId?: string;

  @IsOptional()
  @IsString()
  membershipTier?: string;

  @IsNotEmpty()
  @IsDateString()
  startedAt: string;

  @IsNotEmpty()
  @IsDateString()
  expiredAt: string;
}

export class UpdateDiscountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsString()
  venueTypeId?: string;

  @IsOptional()
  @IsString()
  membershipTier?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  expiredAt?: string;
}

// ===== APPLY DTOs =====
export class CreateApplyDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  discountId: string;
}

export class UpdateApplyDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  oldDiscountId: string;

  @IsNotEmpty()
  @IsString()
  newDiscountId: string;
}

export class DeleteApplyDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  discountId: string;
}
