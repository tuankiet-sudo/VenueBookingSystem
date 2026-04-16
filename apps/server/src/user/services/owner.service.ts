import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
// import { TableService } from '../../database/table.service';
import { CREATE_OWNER_TABLE_QUERY } from '../../database/queries';
import { OwnerSignupDto } from '../../auth/auth.dto';
import { convertUUIDtoBinaryHex } from '../../utils';
import { UpdateOwnerDto } from '../user.dto';

@Injectable()
export class OwnerService {
  protected readonly logger = new Logger(OwnerService.name);
  protected readonly tableName = 'owners';
  protected readonly createTableQuery = CREATE_OWNER_TABLE_QUERY;

  constructor(private databaseService: DatabaseService) {}

  public async createNewOwner(userId: string, ownerSignupDto: OwnerSignupDto) {
    const { bankId, bankName, accountName, accountNumber } = ownerSignupDto;
    await this.databaseService.execute(`CALL Owner_Insert(?, ?, ?, ?, ?)`, [
      userId,
      bankId,
      bankName,
      accountName,
      accountNumber,
    ]);
  }

  public async findOwnerByClientId(userId: string) {
    const result = await this.databaseService.execute<{ user_id: Buffer }>(
      `SELECT * FROM owners WHERE user_id=?`,
      [convertUUIDtoBinaryHex(userId)],
    );
    if (!result || result.length === 0) {
      throw new NotFoundException('Owner not found');
    }
    return result[0];
  }

  public async updateOwner(userId: string, updateOwnerDto: UpdateOwnerDto) {
    const { bankId, bankName, accountName, accountNo } = updateOwnerDto;
    await this.databaseService.execute(`CALL Owner_Update(?, ?, ?, ?, ?)`, [
      userId,
      bankId,
      bankName,
      accountName,
      accountNo,
    ]);
  }
}
