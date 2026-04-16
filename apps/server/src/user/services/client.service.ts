import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClientService {
  constructor(private databaseService: DatabaseService) {}

  public async createNewClient(userId: string) {
    const slug = `${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await this.databaseService.execute(`Call Client_Insert(?, ?);`, [
      userId,
      slug,
    ]);
  }
}
