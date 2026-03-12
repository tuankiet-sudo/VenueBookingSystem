CREATE PROCEDURE ListLocations (
    IN p_city VARCHAR(50),
    IN p_ward VARCHAR(50),
    IN p_minCapacity INT,
    IN p_startTime DATETIME,
    IN p_endTime DATETIME,
    IN p_minPrice DECIMAL(10, 2),
    IN p_maxPrice DECIMAL(10, 2),
    IN p_minArea INT,
    IN p_minAvgRating DECIMAL(2, 1),
    IN p_sort VARCHAR(4) -- 'ASC' or 'DESC'
)
BEGIN
    -- 1. Setup Variables
    -- Default sort direction if invalid
    IF UPPER(p_sort) NOT IN ('ASC', 'DESC') THEN SET p_sort = 'ASC'; END IF;

    -- 2. Base Query Construction
    -- We join tables to access venue details.
    -- We select BIN_TO_UUID so the ID is readable in your API.
    SET @sql_query = CONCAT('
        SELECT 
            BIN_TO_UUID(l.location_id) as id,
            l.name as location_name,
            l.addrNo, l.ward, l.city, l.avgRating, l.thumbnailURL,
            MIN(v.pricePerHour) as startingPrice,
            COUNT(v.name) as availableVenues
        FROM locations l
        JOIN venues v ON l.location_id = v.location_id
        JOIN venue_types vt ON v.venueType_id = vt.venueType_id
        WHERE l.isActive = 1 AND v.isActive = 1
    ');

    -- 3. Dynamic Filter Construction
    SET @vars_list = '';

    -- A. LOCATION FILTERS (City & Ward)
    IF p_city IS NOT NULL AND p_city != '' THEN
        SET @sql_query = CONCAT(@sql_query, ' AND l.city = ?');
        SET @p_city = p_city;
        SET @vars_list = CONCAT(@vars_list, '@p_city, ');
    END IF;

    IF p_ward IS NOT NULL AND p_ward != '' THEN
        SET @sql_query = CONCAT(@sql_query, ' AND l.ward = ?');
        SET @p_ward = p_ward;
        SET @vars_list = CONCAT(@vars_list, '@p_ward, ');
    END IF;

    -- B. RATING FILTER
    IF p_minAvgRating IS NOT NULL AND p_minAvgRating > 0 THEN
        SET @sql_query = CONCAT(@sql_query, ' AND l.avgRating >= ?');
        SET @p_rating = p_minAvgRating;
        SET @vars_list = CONCAT(@vars_list, '@p_rating, ');
    END IF;

    -- C. PRICE RANGE FILTERS
    IF p_minPrice IS NOT NULL AND p_minPrice >= 0 THEN
        SET @sql_query = CONCAT(@sql_query, ' AND v.pricePerHour >= ?');
        SET @p_minPrice = p_minPrice;
        SET @vars_list = CONCAT(@vars_list, '@p_minPrice, ');
    END IF;

    IF p_maxPrice IS NOT NULL AND p_maxPrice > 0 THEN
        SET @sql_query = CONCAT(@sql_query, ' AND v.pricePerHour <= ?');
        SET @p_maxPrice = p_maxPrice;
        SET @vars_list = CONCAT(@vars_list, '@p_maxPrice, ');
    END IF;

    -- D. CAPACITY & AREA FILTERS
    IF p_minCapacity IS NOT NULL AND p_minCapacity > 0 THEN
        SET @sql_query = CONCAT(@sql_query, ' AND vt.maxCapacity >= ?');
        SET @p_cap = p_minCapacity;
        SET @vars_list = CONCAT(@vars_list, '@p_cap, ');
    END IF;

    IF p_minArea IS NOT NULL AND p_minArea > 0 THEN
        SET @sql_query = CONCAT(@sql_query, ' AND vt.area >= ?');
        SET @p_area = p_minArea;
        SET @vars_list = CONCAT(@vars_list, '@p_area, ');
    END IF;

    -- E. TIME AVAILABILITY FILTER (The "Free" check)
    -- Logic: Exclude venues that have an overlapping order
    IF p_startTime IS NOT NULL AND p_endTime IS NOT NULL THEN
        SET @sql_query = CONCAT(@sql_query, ' 
            AND NOT EXISTS (
                SELECT 1 FROM orders o 
                WHERE o.venue_loc_id = v.location_id 
                AND o.venueName = v.name 
                AND o.status IN ("PENDING", "CONFIRMED")
                AND o.startHour < ?   -- Order overlaps if it Starts BEFORE you End
                AND o.endHour > ?     -- AND Ends AFTER you Start
            )
        ');
        -- Bind variables: End Time first, then Start Time
        SET @p_req_end = p_endTime;
        SET @p_req_start = p_startTime;
        SET @vars_list = CONCAT(@vars_list, '@p_req_end, @p_req_start, '); 
    END IF;

    -- 4. Grouping & Sorting
    -- We group by Location ID to show unique locations.
    -- We filter (HAVING) to ensure the location has at least 1 venue matching ALL criteria.
    -- We Sort STRICTLY by calculated startingPrice.
    SET @sql_query = CONCAT(@sql_query, ' 
        GROUP BY l.location_id 
        HAVING availableVenues > 0
        ORDER BY startingPrice ', p_sort
    );

    -- 5. Execution Logic
    PREPARE stmt FROM @sql_query;
    
    IF LENGTH(@vars_list) > 0 THEN
        -- Remove the trailing comma from the variable list
        SET @vars_list = TRIM(TRAILING ', ' FROM @vars_list);
        
        -- Run with parameters
        SET @final_cmd = CONCAT('EXECUTE stmt USING ', @vars_list);
        PREPARE runner FROM @final_cmd;
        EXECUTE runner;
        DEALLOCATE PREPARE runner;
    ELSE
        -- Run without parameters (if all inputs are NULL)
        EXECUTE stmt;
    END IF;
    
    DEALLOCATE PREPARE stmt;

END //

DELIMITER ;