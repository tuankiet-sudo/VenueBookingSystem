DELIMITER $$

CREATE PROCEDURE getClientInvoices(
    IN p_clientId BINARY(16)
)
BEGIN
  SELECT
    BIN_TO_UUID(i.invoice_id) AS invoice_id,
    BIN_TO_UUID(i.order_id) AS order_id,
    i.amount,
    i.status,
    i.senderBankAccount,
    i.receiverBankAccount,
    i.transaction_id,
    i.paidOn,
    i.description
  FROM invoices i
  JOIN orders o ON i.order_id = o.order_id
  WHERE o.client_id = p_clientId
  ORDER BY i.paidOn DESC;
END$$

DELIMITER ;
