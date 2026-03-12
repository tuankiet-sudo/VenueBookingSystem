-- =============================================================================
-- DỮ LIỆU MẪU: 20 ĐÁNH GIÁ (Khớp với 20 đơn hàng đã hoàn tất)
-- Lưu ý: Đảm bảo bạn đã chạy script tạo Orders trước đó rồi mới chạy script này
-- =============================================================================

-- 1. Alice (User 1) -> Rate Location 1 & 2
CALL Rate_Insert('11111111-1111-1111-1111-111111111111', '10101010-1010-1010-1010-101010101001', 5, 'Sảnh hội nghị Sunrise rất hoành tráng, âm thanh ánh sáng tuyệt vời.');
CALL Rate_Insert('11111111-1111-1111-1111-111111111111', '10101010-1010-1010-1010-101010101002', 4, 'Phòng Training nhỏ gọn, tiện lợi, nhân viên hỗ trợ tốt.');

-- 2. Bob (User 2) -> Rate Location 2 & 3
CALL Rate_Insert('22222222-2222-2222-2222-222222222222', '10101010-1010-1010-1010-101010101002', 3, 'Cách âm phòng Annex chưa tốt lắm, vẫn nghe tiếng ồn bên ngoài.');
CALL Rate_Insert('22222222-2222-2222-2222-222222222222', '20202020-2020-2020-2020-202020202001', 5, 'Grace Events Center tổ chức tiệc cưới quá đẹp, rất chuyên nghiệp.');

-- 3. Charlie (User 3) -> Rate Location 3 & 4
CALL Rate_Insert('33333333-3333-3333-3333-333333333333', '20202020-2020-2020-2020-202020202001', 5, 'Sảnh tiệc rộng, trang trí lộng lẫy, đồ ăn ngon.');
CALL Rate_Insert('33333333-3333-3333-3333-333333333333', '20202020-2020-2020-2020-202020202002', 4, 'Studio sáng tạo, nhiều đạo cụ chụp ảnh đẹp.');

-- 4. David (User 4) -> Rate Location 4 & 5
CALL Rate_Insert('44444444-4444-4444-4444-444444444444', '20202020-2020-2020-2020-202020202002', 5, 'Không gian Creative Hub rất truyền cảm hứng làm việc.');
CALL Rate_Insert('44444444-4444-4444-4444-444444444444', '30303030-3030-3030-3030-303030303001', 4, 'Heidi Banquet Hall sang trọng, nhưng giá hơi cao so với mặt bằng.');

-- 5. Eve (User 5) -> Rate Location 5 & 6
CALL Rate_Insert('55555555-5555-5555-5555-555555555555', '30303030-3030-3030-3030-303030303001', 5, 'Dịch vụ 5 sao, phòng tiệc riêng tư rất ấm cúng.');
CALL Rate_Insert('55555555-5555-5555-5555-555555555555', '30303030-3030-3030-3030-303030303002', 3, 'Phòng họp Suite A hơi bí, cần thêm quạt thông gió.');

-- 6. Frank (User 6) -> Rate Location 6 & 7
CALL Rate_Insert('66666666-6666-6666-6666-666666666666', '30303030-3030-3030-3030-303030303002', 4, 'Phòng phỏng vấn chuyên nghiệp, wifi nhanh.');
CALL Rate_Insert('66666666-6666-6666-6666-666666666666', '40404040-4040-4040-4040-404040404001', 5, 'Rooftop Bar quá chill, view thành phố về đêm cực đẹp.');

-- 7. Grace (User 7) -> Rate Location 7 & 8
CALL Rate_Insert('77777777-7777-7777-7777-777777777777', '40404040-4040-4040-4040-404040404001', 4, 'BBQ ngon, không gian thoáng, nhưng gió hơi mạnh.');
CALL Rate_Insert('77777777-7777-7777-7777-777777777777', '40404040-4040-4040-4040-404040404002', 5, 'Phòng hội thảo Ivan setup rất chuẩn, màn chiếu sắc nét.');

-- 8. Heidi (User 8) -> Rate Location 8 & 9
CALL Rate_Insert('88888888-8888-8888-8888-888888888888', '40404040-4040-4040-4040-404040404002', 4, 'Phòng Board Room yên tĩnh, ghế ngồi thoải mái.');
CALL Rate_Insert('88888888-8888-8888-8888-888888888888', '50505050-5050-5050-5050-505050505001', 5, 'Judy Gallery là nơi tuyệt vời để tổ chức triển lãm nghệ thuật.');

-- 9. Ivan (User 9) -> Rate Location 9 & 10
CALL Rate_Insert('99999999-9999-9999-9999-999999999999', '50505050-5050-5050-5050-505050505001', 4, 'Khu vực Pop-up rộng rãi, dễ bố trí gian hàng.');
CALL Rate_Insert('99999999-9999-9999-9999-999999999999', '50505050-5050-5050-5050-505050505002', 5, 'Phòng làm gốm rất thú vị, đầy đủ dụng cụ.');

-- 10. Judy (User 10) -> Rate Location 10 & 1
CALL Rate_Insert('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '50505050-5050-5050-5050-505050505002', 5, 'Art Garden có ánh sáng tự nhiên rất đẹp để vẽ tranh.');
CALL Rate_Insert('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '10101010-1010-1010-1010-101010101001', 5, 'Phòng VIP tại Sunrise Hall rất đẳng cấp, dịch vụ hoàn hảo.');