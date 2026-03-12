DELIMITER $$
CREATE PROCEDURE GetDiscountInfo()
BEGIN
    SELECT 
        BIN_TO_UUID(d.discount_id)                 AS discount_id,
        d.name                                     AS name,
        d.percentage                               AS percentage,
        d.maxDiscountPrice                         AS maxDiscountPrice,
        d.minPrice                                 AS minPrice,
        BIN_TO_UUID(d.venueTypeId)                 AS venueTypeId,
        vt.name                                    AS venueTypeName,
        d.membershipTier                           AS membershipTier,
        d.startedAt                                AS startedAt,
        d.expiredAt                                AS expiredAt
    FROM 
        discounts d left join venue_types vt 
    ON d.venueTypeId = vt.venueType_id
    ORDER BY name ASC;
END$$
DELIMITER ;