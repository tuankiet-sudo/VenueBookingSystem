export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class Order {
  public order_id: Buffer; // BINARY(16) (Primary Key)
  public client_id: Buffer | null; // BINARY(16) (Foreign Key)
  public venue_loc_id: Buffer | null; // BINARY(16) (Foreign Key, part of composite key)
  public venueName: string | null; // VARCHAR(100) (Foreign Key, part of composite key)
  public totalPrice: number; // DECIMAL(12, 2)
  public status: OrderStatus; // ENUM (Default 'PENDING')
  public startHour: Date; // DATETIME
  public endHour: Date; // DATETIME
  public points: number; // INT
  public expiredAt: Date; // DATETIME
  public createdAt: Date; // DATETIME
  public updatedAt: Date; // DATETIME
}
