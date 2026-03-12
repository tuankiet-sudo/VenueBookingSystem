import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class InvoiceService {
  constructor(private databaseService: DatabaseService) {}
}
