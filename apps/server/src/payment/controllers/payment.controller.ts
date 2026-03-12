import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import {
  CreateInvoiceDto,
  UpdateInvoiceStatusDto,
  CreateDiscountDto,
  UpdateDiscountDto,
  CreateApplyDto,
  UpdateApplyDto,
  DeleteApplyDto,
} from '../dto/payment.dto';
import { AdminGuard, AuthGuard } from 'src/auth/guards';

@ApiTags('Payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ===== INVOICE ENDPOINTS =====
  @Post('/invoices')
  @ApiOperation({ summary: 'Create an invoice for an order' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    const data = await this.paymentService.createInvoice(dto);
    return data;
  }

  // @Patch('/invoices/complete')
  // @ApiOperation({ summary: 'Mark invoice as paid with transaction details' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Invoice payment completed successfully',
  // })
  // @ApiResponse({ status: 404, description: 'Invoice not found' })
  // async completeInvoicePayment(@Body() dto: CompleteInvoicePaymentDto) {
  //   await this.paymentService.completeInvoicePayment(dto);
  //   return { message: 'Invoice payment completed successfully' };
  // }

  @Patch('/webhook')
  @ApiOperation({ summary: 'Webhook to update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  async webhookUpdateOrderStatus(
    @Body()
    payload: {
      orderId: string;
      invoiceId: string;
    },
  ) {
    await this.paymentService.webhookUpdateOrderStatus(payload);
  }

  @Patch('/invoices/status')
  @ApiOperation({ summary: 'Update invoice payment status' })
  @ApiResponse({
    status: 200,
    description: 'Invoice status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async updateInvoiceStatus(@Body() dto: UpdateInvoiceStatusDto) {
    await this.paymentService.updateInvoiceStatus(dto);
    return { message: 'Invoice status updated successfully' };
  }

  // ===== DISCOUNT ENDPOINTS =====
  @Post('/discounts')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new discount code (Admin only)' })
  @ApiResponse({ status: 201, description: 'Discount created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createDiscount(@Body() dto: CreateDiscountDto) {
    const discountId = await this.paymentService.createDiscount(dto);
    return { _id: discountId };
  }

  @Get('/discounts/preview')
  @UseGuards(AdminGuard)
  async previewDiscounts() {
    const discounts = await this.paymentService.previewDiscounts();
    return { data: discounts };
  }

  // @Get('/discounts/:code')
  // @UseGuards(AdminGuard)
  // async getDiscountByCode(@Param('code') code: string) {
  //   const discount = await this.paymentService.getDiscountByCode(code);
  //   return discount;
  // }

  @Patch('/discounts/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update discount details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  async updateDiscount(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
  ) {
    await this.paymentService.updateDiscount(id, dto);
    return { message: 'Discount updated successfully' };
  }

  @Delete('/discounts/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a discount (Admin only)' })
  @ApiResponse({ status: 200, description: 'Discount deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  async deleteDiscount(@Param('id') id: string) {
    await this.paymentService.deleteDiscount(id);
    return { message: 'Discount deleted successfully' };
  }

  // ===== APPLY DISCOUNT ENDPOINTS =====
  @Post('/applies')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply a discount code to an order' })
  @ApiResponse({ status: 201, description: 'Discount applied successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async applyDiscount(@Body() dto: CreateApplyDto) {
    await this.paymentService.applyDiscount(dto);
    return { message: 'Discount applied successfully' };
  }

  @Patch('/applies')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change the discount applied to an order' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateApply(@Body() dto: UpdateApplyDto) {
    await this.paymentService.updateApply(dto);
    return { message: 'Discount updated successfully' };
  }

  @Delete('/applies')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a discount from an order' })
  @ApiResponse({ status: 200, description: 'Discount removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeDiscount(@Body() dto: DeleteApplyDto) {
    await this.paymentService.removeDiscount(dto);
    return { message: 'Discount removed successfully' };
  }
}
