DELIMITER $$
CREATE PROCEDURE GetVenueTypesInfo()
BEGIN
    SELECT 
        BIN_TO_UUID(venueType_id)                AS venue_type_id,
        name                                     AS name,
        description                              AS description,
        minCapacity                              AS min_capacity,
        maxCapacity                              AS max_capacity
    FROM 
        venue_types;
    ORDER BY name ASC;
END$$
DELIMITER ;