import { IsNotEmpty, IsOptional } from 'class-validator';
import { MembershipTier } from 'src/user/entities';

export class CreatePaymentDto {}

export class CreateDiscountDto {
  @IsNotEmpty()
  name: string; // VARCHAR(100)

  @IsNotEmpty()
  percentage: number; // INT CHECK (0 AND 100)

  @IsOptional()
  maxDiscountPrice?: number; // DECIMAL(12, 2)

  @IsOptional()
  minPrice?: number; // DECIMAL(12, 2)

  @IsOptional()
  venueTypeId?: string; // BINARY(16) (Foreign Key)

  @IsOptional()
  membershipTier?: MembershipTier[]; // SET

  @IsNotEmpty()
  startedAt: string; // DATETIME

  @IsNotEmpty()
  expiredAt: string; // DATETIME
}

export class ProcessPaymentDto {
  @IsNotEmpty()
  orderId: string; // Links to the PENDING order

  @IsNotEmpty()
  senderBankAccount: string; // VARCHAR(50)

  @IsNotEmpty()
  receiverBankAccount: string; // VARCHAR(50)

  @IsNotEmpty()
  transactionId: string; // Received from the payment gateway

  @IsOptional()
  description?: string;
}
