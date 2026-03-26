import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateOrderDto,
  UpdateOrderDto,
  AddOrderAmenityDto,
  RemoveOrderAmenityDto,
} from './dto/order.dto';
import {
  ClientOrderResponseDto,
  InvoiceCreateDataResponseDto,
} from './dto/order-response.dto';
import { DatabaseService } from 'src/database/database.service';
import dayjs from 'dayjs';

@Injectable()
export class OrderService {
  constructor(private databaseService: DatabaseService) {}

  // ===== ORDER OPERATIONS =====
  public async createOrder(
    clientId: string,
    dto: CreateOrderDto,
  ): Promise<{ expiredTime: Date; orderId: string }> {
    const { v4: uuidv4 } = await import('uuid');
    const orderId = uuidv4();

    try {
      await this.databaseService.execute(
        `CALL Order_Insert(?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          clientId,
          dto.locationId,
          dto.venueName,
          new Date(dto.startTime),
          new Date(dto.endTime),
        ],
      );

      const expiredTime: Date = dayjs().add(15, 'minute').toDate();

      // Add amenities if provided
      if (dto.amenityIds && dto.amenityIds.length > 0) {
        for (const amenityName of dto.amenityIds) {
          await this.databaseService.execute(`CALL OrderAmenity_Insert(?, ?)`, [
            orderId,
            amenityName,
          ]);
        }
      }

      if (dto.discountIds && dto.discountIds.length > 0) {
        for (const discountId of dto.discountIds) {
          await this.databaseService.execute(`CALL Applies_Insert(?, ?)`, [
            orderId,
            discountId,
          ]);
        }
      }

      return { expiredTime, orderId };
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create order');
    }
  }

  public async getPreviewOrderMetadata(
    locationId: string,
    venueName: string,
    startTime: string,
    endTime: string,
    userId: string,
  ): Promise<any> {
    try {
      const amenities = await this.databaseService.execute(
        `CALL Get_Valid_Amenities(?, ?, ?, ?)`,
        [locationId, venueName, new Date(startTime), new Date(endTime)],
      );
      const discounts = await this.databaseService.execute(
        `CALL Get_Valid_Discounts(?, ?, ?, ?, ?)`,
        [userId, locationId, venueName, new Date(startTime), new Date(endTime)],
      );
      return { discounts, amenities };
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get discounts by venue',
      );
    }
  }

  public async updateOrder(id: string, dto: UpdateOrderDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Order_Update(?, ?, ?, ?)`, [
        id,
        dto.totalPrice !== undefined ? dto.totalPrice : null,
        dto.points !== undefined ? dto.points : null,
        dto.status || null,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to update order');
    }
  }

  public async cancelOrder(payload: {
    orderId: string;
    invoiceId: string;
  }): Promise<void> {
    try {
      // await this.databaseService.execute(`CALL Order_Update(?, ?, ?, ?)`, [
      //   payload.orderId,
      //   null,
      //   null,
      //   'CANCELLED',
      // ]);
      // await this.databaseService.execute(`CALL Invoice_UpdateStatus(?, ?, ?)`, [
      //   payload.invoiceId,
      //   'FAILED',
      //   `Cancel payment for order ${payload.orderId}`,
      // ]);
      await this.databaseService.execute(`CALL Order_Cancel(?, ?)`, [
        payload.orderId,
        `Cancel payment for order ${payload.orderId}`,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to cancel order');
    }
  }

  public async getUncompletedOrders(clientId: string): Promise<any> {
    try {
      const results = await this.databaseService.execute<{
        orderId: string;
        invoiceId: string;
      }>(`CALL Get_Uncompleted_Orders(?)`, [clientId]);
      if (!results[0]) {
        throw new NotFoundException('No order incomplete');
      }
      const { orderId, invoiceId } = results[0];
      const data = await this.databaseService.execute<{
        totalPrice: string;
        accountNo: string;
        accountName: string;
        bankId: string;
      }>(`CALL GetInvoiceCreateData(?)`, [orderId]);
      const { totalPrice, accountNo, accountName, bankId } = data[0];
      return {
        totalPrice,
        url: encodeURI(
          `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${totalPrice}&addInfo=Pay%20for%20booking%20${invoiceId}&accountName=${accountName}`,
        ),
      };
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to retrieve uncompleted orders',
      );
    }
  }

  public async deleteOrder(id: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Order_Delete(?)`, [id]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete order');
    }
  }

  // ===== ORDER AMENITY OPERATIONS =====
  public async addOrderAmenity(dto: AddOrderAmenityDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL OrderAmenity_Insert(?, ?)`, [
        dto.orderId,
        dto.amenityName,
      ]);
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to add amenity to order',
      );
    }
  }

  public async removeOrderAmenity(dto: RemoveOrderAmenityDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL OrderAmenity_Delete(?, ?)`, [
        dto.orderId,
        dto.amenityName,
      ]);
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to remove amenity from order',
      );
    }
  }

  public async getOrdersByLocation(
    ownerId: string,
    orderQuery: {
      locationId?: string;
      orderStatus?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    try {
      const results = await this.databaseService.execute(
        `CALL getOrdersForOwner(?, ?, ?, ?, ?)`,
        [
          ownerId,
          orderQuery.locationId || null,
          orderQuery.orderStatus || null,
          orderQuery.startDate ? new Date(orderQuery.startDate) : null,
          orderQuery.endDate ? new Date(orderQuery.endDate) : null,
        ],
      );
      return results;
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to retrieve orders for owner',
      );
    }
  }

  // ===== CLIENT ORDER OPERATIONS =====
  public async getClientOrders(
    clientId: string,
    status?: string,
  ): Promise<ClientOrderResponseDto[]> {
    try {
      const results = await this.databaseService.execute<any>(
        `CALL Client_GetOrders(?, ?)`,
        [clientId, status || null],
      );

      return results || [];
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get client orders',
      );
    }
  }

  public async getInvoiceCreateData(
    orderId: string,
  ): Promise<InvoiceCreateDataResponseDto> {
    try {
      const results = await this.databaseService.execute<any>(
        `CALL GetInvoiceCreateData(?)`,
        [orderId],
      );

      if (!results || results.length === 0) {
        throw new ConflictException('Order not found or has no invoice data');
      }

      return results[0];
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to get invoice create data',
      );
    }
  }
}
