-- invoice
DELIMITER $$

-- 1. Invoice_Create (TỐI ƯU: Bỏ tham số status)
CREATE PROCEDURE Invoice_Insert(
    IN p_id VARCHAR(36),
    IN p_orderId VARCHAR(36),
    IN p_amount DECIMAL(12,2)
)
BEGIN
    DECLARE v_orderId BINARY(16);
    SET v_orderId = UUID_TO_BIN(p_orderId);

    -- 1. Validate Amount
    IF p_amount <= 0 THEN
        SIGNAL SQLSTATE '45109' SET MESSAGE_TEXT = 'Error: Invoice amount must be greater than 0.';
    END IF;

    -- 2. Validate Order Existence
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_id = v_orderId) THEN
        SIGNAL SQLSTATE '45110' SET MESSAGE_TEXT = 'Error: Order does not exist.';
    END IF;

    -- 3. Validate Duplicate (1 Order - 1 Invoice)
    IF EXISTS (SELECT 1 FROM invoices WHERE order_id = v_orderId) THEN
        SIGNAL SQLSTATE '45111' SET MESSAGE_TEXT = 'Error: An Invoice already exists for this Order.';
    END IF;
    -- Chỉ insert 3 cột cốt lõi. 
    -- Cột 'status' sẽ tự động nhận giá trị 'PENDING' từ Default của bảng.
    -- Các cột bank, transaction, paidOn, description sẽ tự nhận NULL.
    INSERT INTO invoices (
        invoice_id, 
        order_id, 
        amount
    )
    VALUES (
        UUID_TO_BIN(p_id), 
        UUID_TO_BIN(p_orderId), 
        p_amount
    );
END$$

-- 2. Invoice_CompletePayment
-- THÊM tham số p_desc để nhận nội dung từ ngân hàng (VD: "KH Tran Van A chuyen khoan...")
CREATE PROCEDURE Invoice_CompletePayment(
    IN p_id VARCHAR(36),
    IN p_senderBank VARCHAR(50),
    IN p_recvBank VARCHAR(50),
    IN p_transId VARCHAR(50),
    IN p_desc TEXT  -- <--- Bổ sung tham số này
)
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_id = v_id) THEN
        SIGNAL SQLSTATE '45112' SET MESSAGE_TEXT = 'Error: Invoice does not exist.';
    END IF;

    -- 2. Validate Transaction Info (Bắt buộc phải có)
    IF p_transId IS NULL OR p_transId = '' THEN
        SIGNAL SQLSTATE '45113' SET MESSAGE_TEXT = 'Error: Transaction ID is required for completed payments.';
    END IF;

    -- Execute Update
    UPDATE invoices 
    SET 
        status = 'SUCCEEDED',
        senderBankAccount = p_senderBank,
        receiverBankAccount = p_recvBank,
        transaction_id = p_transId,
        description = p_desc,
        paidOn = NOW()
    WHERE invoice_id = v_id;
END$$

-- 3. Invoice_UpdateStatus (Dùng cho FAILED)
-- Cũng nên cho phép cập nhật lý do lỗi vào description
CREATE PROCEDURE Invoice_UpdateStatus(
    IN p_id VARCHAR(36),
    IN p_status VARCHAR(20),
    IN p_desc TEXT -- <--- Thêm lý do lỗi (VD: "Số dư không đủ")
)
BEGIN
    DECLARE v_id BINARY(16);
    SET v_id = UUID_TO_BIN(p_id);

    -- 1. Check Existence
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_id = v_id) THEN
        SIGNAL SQLSTATE '45114' SET MESSAGE_TEXT = 'Error: Invoice does not exist.';
    END IF;

    -- 2. Validate Status Enum
    IF p_status NOT IN ('PENDING', 'SUCCEEDED', 'FAILED') THEN
        SIGNAL SQLSTATE '45115' SET MESSAGE_TEXT = 'Error: Invalid status value.';
    END IF;

    -- Execute Update
    UPDATE invoices 
    SET 
        status = p_status,
        description = p_desc
    WHERE invoice_id = v_id;
END$$

DELIMITER ;
