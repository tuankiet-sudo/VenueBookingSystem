export enum InvoiceStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export class Invoices {
  public invoice_id: Buffer; // BINARY(16) (Primary Key)
  public order_id: Buffer | null; // BINARY(16) (Foreign Key)
  public amount: number; // DECIMAL(12, 2)
  public status: InvoiceStatus; // ENUM (Default 'PENDING')
  public senderBankAccount: string | null; // VARCHAR(50)
  public receiverBankAccount: string | null; // VARCHAR(50)
  public transaction_id: string | null; // VARCHAR(50)
  public paidOn: Date | null; // DATETIME
  public description: string | null; // TEXT
}
