import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class InvoiceService {
  constructor(private databaseService: DatabaseService) {}
}
