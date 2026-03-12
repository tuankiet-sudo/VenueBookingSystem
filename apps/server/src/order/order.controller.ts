import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  AddOrderAmenityDto,
  RemoveOrderAmenityDto,
} from './dto/order.dto';
import {
  ClientOrderResponseDto,
  InvoiceCreateDataResponseDto,
  GetClientOrdersQueryDto,
} from './dto/order-response.dto';
import { AuthGuard, OwnerGuard } from 'src/auth/guards';
import { User } from 'src/auth/decorators';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ===== ORDER ENDPOINTS =====
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new booking order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateOrderDto, @User() user: Express.User) {
    const { orderId, expiredTime } = await this.orderService.createOrder(
      user.userId,
      dto,
    );
    return { _id: orderId, expiredTime };
  }

  @Get('/uncompleted')
  @UseGuards(AuthGuard)
  async getUncompletedOrders(@User() user: Express.User) {
    const data = await this.orderService.getUncompletedOrders(user.userId);
    return data;
  }

  @Patch('/cancelled')
  @ApiOperation({ summary: 'Mark invoice as cancelled' })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async cancelInvoice(
    @Body()
    payload: {
      orderId: string;
      invoiceId: string;
    },
  ) {
    await this.orderService.cancelOrder(payload);
  }

  @Get('/metadata')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get available amenities and discounts for booking',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadata retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDiscountsByVenue(
    @Query('locationId') locationId: string,
    @Query('venueName') venueName: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @User() user: Express.User,
  ) {
    const data = await this.orderService.getPreviewOrderMetadata(
      locationId,
      venueName,
      startTime,
      endTime,
      user.userId,
    );
    return data;
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order details' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    await this.orderService.updateOrder(id, dto);
    return { message: 'Order updated successfully' };
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel/delete an order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id') id: string) {
    await this.orderService.deleteOrder(id);
    return { message: 'Order deleted successfully' };
  }

  // ===== ORDER AMENITY ENDPOINTS =====
  @Post('/amenities')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add an amenity to an order' })
  @ApiResponse({
    status: 201,
    description: 'Amenity added to order successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async addAmenity(@Body() dto: AddOrderAmenityDto) {
    await this.orderService.addOrderAmenity(dto);
  }

  @Delete('/amenities')
  @UseGuards(OwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove an amenity from an order' })
  @ApiResponse({
    status: 200,
    description: 'Amenity removed from order successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  async removeAmenity(@Body() dto: RemoveOrderAmenityDto) {
    await this.orderService.removeOrderAmenity(dto);
    return { message: 'Amenity removed from order successfully' };
  }

  @Get('/owner')
  @UseGuards(OwnerGuard)
  async getOrdersByLocation(
    @Query()
    orderQuery: {
      locationId?: string;
      orderStatus?: string;
      startDate?: string;
      endDate?: string;
    },
    @User() user: Express.User,
  ) {
    const orders = await this.orderService.getOrdersByLocation(
      user.userId,
      orderQuery,
    );
    return orders;
  }

  // ===== CLIENT ORDER ENDPOINTS =====
  @Get('/client')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get orders for current client with optional status filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [ClientOrderResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClientOrders(
    @Query() query: GetClientOrdersQueryDto,
    @User() user: Express.User,
  ) {
    const orders = await this.orderService.getClientOrders(
      user.userId,
      query.status,
    );
    return orders;
  }

  @Get('/:orderId/invoice-data')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get invoice creation data for an order' })
  @ApiResponse({
    status: 200,
    description: 'Invoice data retrieved successfully',
    type: InvoiceCreateDataResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getInvoiceCreateData(@Param('orderId') orderId: string) {
    const data = await this.orderService.getInvoiceCreateData(orderId);
    return data;
  }
}
