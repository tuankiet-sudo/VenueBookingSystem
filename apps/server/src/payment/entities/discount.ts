import { MembershipTier } from 'src/user/entities';

export class Discount {
  public discount_id: Buffer; // BINARY(16) (Primary Key)
  public name: string; // VARCHAR(100)
  public percentage: number; // INT
  public maxDiscountPrice: number | null; // DECIMAL(12, 2)
  public minPrice: number | null; // DECIMAL(12, 2)
  public venueTypeId: Buffer | null; // BINARY(16) (Foreign Key)
  // SET field can be mapped as an array or a bitmask in some ORMs, using array here for clarity
  public membershipTier: MembershipTier[]; // SET
  public startedAt: Date; // DATETIME
  public expiredAt: Date; // DATETIME
  public createdAt: Date; // DATETIME
}
