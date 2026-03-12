import { Injectable, ConflictException } from '@nestjs/common';
import {
  CreateInvoiceDto,
  CompleteInvoicePaymentDto,
  UpdateInvoiceStatusDto,
  CreateDiscountDto,
  UpdateDiscountDto,
  CreateApplyDto,
  UpdateApplyDto,
  DeleteApplyDto,
} from '../dto/payment.dto';
import { DatabaseService } from 'src/database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(private databaseService: DatabaseService) {}

  // ===== INVOICE OPERATIONS =====
  public async createInvoice(
    dto: CreateInvoiceDto,
  ): Promise<{ id: string; url: string; totalPrice: string }> {
    const invoiceId = uuidv4();
    try {
      const data = await this.databaseService.execute<{
        totalPrice: string;
        accountNo: string;
        accountName: string;
        bankId: string;
      }>(`CALL GetInvoiceCreateData(?)`, [dto.orderId]);
      const { totalPrice, accountNo, accountName, bankId } = data[0];
      await this.databaseService.execute(`CALL Invoice_Insert(?, ?, ?)`, [
        invoiceId,
        dto.orderId,
        totalPrice,
      ]);
      return {
        totalPrice,
        id: invoiceId,
        url: encodeURI(
          `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${totalPrice}&addInfo=Payment for order ${dto.orderId}&accountName=${accountName}`,
        ),
      };
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create invoice');
    }
  }

  public async webhookUpdateOrderStatus(payload: {
    orderId: string;
    invoiceId: string;
  }): Promise<void> {
    // Simulate a transaction ID from webhook
    const transactionId = uuidv4();
    try {
      await this.databaseService.execute(`CALL Order_Update(?, ?, ?, ?)`, [
        payload.orderId,
        null,
        null,
        'CONFIRMED',
      ]);
      await this.databaseService.execute(
        `CALL Invoice_CompletePayment(?, ?, ?, ?, ?)`,
        [
          payload.invoiceId,
          'BANK001',
          'BANK002',
          transactionId,
          `Pay for order ${payload.orderId}`,
        ],
      );
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to update order status via webhook',
      );
    }
  }

  public async completeInvoicePayment(
    dto: CompleteInvoicePaymentDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL Invoice_CompletePayment(?, ?, ?, ?, ?)`,
        [
          dto.id,
          dto.senderBank || null,
          dto.receiverBank || null,
          dto.transactionId,
          dto.description || null,
        ],
      );
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to complete invoice payment',
      );
    }
  }

  public async updateInvoiceStatus(dto: UpdateInvoiceStatusDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Invoice_UpdateStatus(?, ?, ?)`, [
        dto.id,
        dto.status,
        dto.description || null,
      ]);
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to update invoice status',
      );
    }
  }

  // ===== DISCOUNT OPERATIONS =====
  public async createDiscount(dto: CreateDiscountDto): Promise<string> {
    const discountId = uuidv4();
    try {
      await this.databaseService.execute(
        `CALL Discount_Insert(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          discountId,
          dto.name,
          dto.percentage,
          dto.maxDiscountPrice || null,
          dto.minPrice || null,
          dto.venueTypeId || null,
          dto.membershipTier || null,
          new Date(dto.startedAt),
          new Date(dto.expiredAt),
        ],
      );
      return discountId;
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to create discount');
    }
  }

  public async updateDiscount(
    id: string,
    dto: UpdateDiscountDto,
  ): Promise<void> {
    try {
      await this.databaseService.execute(
        `CALL Discount_Update(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          dto.name || null,
          dto.percentage || null,
          dto.maxDiscountPrice !== undefined ? dto.maxDiscountPrice : null,
          dto.minPrice !== undefined ? dto.minPrice : null,
          dto.venueTypeId || null,
          dto.membershipTier || null,
          dto.startedAt ? new Date(dto.startedAt) : null,
          dto.expiredAt ? new Date(dto.expiredAt) : null,
        ],
      );
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to update discount');
    }
  }

  public async previewDiscounts() {
    return await this.databaseService.execute(`CALL GetDiscountInfo()`);
  }

  public async deleteDiscount(id: string): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Discount_Delete(?)`, [id]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to delete discount');
    }
  }

  // ===== APPLY OPERATIONS =====
  public async applyDiscount(dto: CreateApplyDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Applies_Insert(?, ?)`, [
        dto.orderId,
        dto.discountId,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to apply discount');
    }
  }

  public async updateApply(dto: UpdateApplyDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Applies_Update(?, ?, ?)`, [
        dto.orderId,
        dto.oldDiscountId,
        dto.newDiscountId,
      ]);
    } catch (error) {
      throw new ConflictException(
        error.message || 'Failed to update applied discount',
      );
    }
  }

  public async removeDiscount(dto: DeleteApplyDto): Promise<void> {
    try {
      await this.databaseService.execute(`CALL Applies_Delete(?, ?)`, [
        dto.orderId,
        dto.discountId,
      ]);
    } catch (error) {
      throw new ConflictException(error.message || 'Failed to remove discount');
    }
  }
}
