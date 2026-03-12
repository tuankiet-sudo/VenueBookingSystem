import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateDiscountDto } from '../dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiscountService {
  constructor(private databaseService: DatabaseService) {}

  public async createDiscount(dto: CreateDiscountDto): Promise<string> {
    const discountIdBinary = uuidv4();
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
