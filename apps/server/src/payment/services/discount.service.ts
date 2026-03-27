import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateDiscountDto } from '../dto/create-payment.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DiscountService {
  constructor(private databaseService: DatabaseService) {}

  public async createDiscount(dto: CreateDiscountDto): Promise<string> {
    const discountIdBinary = randomUUID();
    // MySQL SET type needs to be converted to a comma-separated string
    const membershipTierString = dto.membershipTier
      ? dto.membershipTier.join(',')
      : null;

    await this.databaseService.execute(
      `
      CALL CreateDiscount(?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        discountIdBinary,
        dto.name,
        dto.percentage,
        dto.maxDiscountPrice || null,
        dto.minPrice || null,
        dto.venueTypeId ? dto.venueTypeId : null,
        membershipTierString,
        new Date(dto.startedAt),
        new Date(dto.expiredAt),
      ],
      {
        ER_DUP_ENTRY: () => {
          throw new ConflictException('Discount name already exists.');
        },
      },
    );

    return discountIdBinary;
  }
}
