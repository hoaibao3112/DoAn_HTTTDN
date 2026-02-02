# TÀI LIỆU QUY TRÌNH NGHIỆP VỤ
## HỆ THỐNG QUẢN LÝ BÁN SÁCH OFFLINE

---

## 1. QUẢN LÝ TÀI KHOẢN VÀ PHÂN QUYỀN

### 1.1 Đăng nhập và Xác thực
Hệ thống sử dụng cơ chế đăng nhập bằng tên tài khoản và mật khẩu. Khi người dùng đăng nhập thành công, hệ thống sẽ cấp một token xác thực (JWT) để sử dụng cho các phiên làm việc tiếp theo. Token này có thời gian hiệu lực nhất định và cần được làm mới khi hết hạn.

### 1.2 Quản lý Tài khoản
Quản trị viên có thể tạo mới, chỉnh sửa và vô hiệu hóa tài khoản người dùng. Mỗi tài khoản được gắn với một nhân viên cụ thể trong hệ thống và được phân quyền thông qua vai trò (role). Hệ thống hỗ trợ đổi mật khẩu và khôi phục mật khẩu quên thông qua email.

### 1.3 Phân quyền theo Vai trò (RBAC)
Hệ thống áp dụng mô hình phân quyền dựa trên vai trò với các cấp độ:
- **Quản trị viên hệ thống**: Có toàn quyền điều khiển mọi chức năng
- **Quản lý**: Quản lý nhân viên, kho hàng, và xem báo cáo
- **Nhân viên bán hàng**: Thực hiện giao dịch bán hàng, quản lý khách hàng
- **Nhân viên kho**: Quản lý nhập kho, kiểm kê, chuyển kho
- **Kế toán**: Quản lý công nợ, thanh toán, báo cáo tài chính

Mỗi vai trò được gán các quyền cụ thể cho từng chức năng (Xem, Thêm, Sửa, Xóa, Duyệt).

---

## 2. QUẢN LÝ NHÂN SỰ (HR)

### 2.1 Quản lý Hồ sơ Nhân viên
Hệ thống lưu trữ đầy đủ thông tin nhân viên bao gồm thông tin cá nhân (họ tên, ngày sinh, CCCD, địa chỉ, số điện thoại, email), thông tin công việc (chức vụ, ngày vào làm, chi nhánh làm việc, ca làm việc), và thông tin lương (lương cơ bản, phụ cấp).

Quản lý có thể thêm mới nhân viên vào hệ thống, đồng thời tạo tài khoản đăng nhập cho họ. Khi nhân viên nghỉ việc, hệ thống sẽ cập nhật trạng thái và vô hiệu hóa tài khoản tương ứng.

### 2.2 Quản lý Chấm công
Nhân viên thực hiện chấm công vào và chấm công ra hàng ngày thông qua hệ thống. Khi chấm công vào, hệ thống ghi nhận thời gian và so sánh với giờ bắt đầu ca làm việc để xác định trạng thái (Đúng giờ hoặc Trễ).

Khi chấm công ra, hệ thống tính toán số giờ làm việc thực tế, tự động trừ thời gian nghỉ giữa ca nếu làm việc trên 5 giờ, và xác định trạng thái về sớm nếu rời khỏi trước giờ kết thúc ca.

Quản lý có thể xem bảng chấm công của toàn bộ nhân viên theo tháng, chỉnh sửa hoặc thêm bản ghi chấm công thủ công khi cần thiết (ví dụ: nhân viên quên chấm công).

### 2.3 Quản lý Nghỉ phép
Nhân viên có thể gửi đơn xin nghỉ phép thông qua hệ thống, bao gồm các loại: nghỉ phép thường, nghỉ ốm, nghỉ thai sản, và nghỉ việc.

Đơn xin nghỉ cần ghi rõ thời gian bắt đầu, kết thúc và lý do. Sau khi gửi, đơn sẽ ở trạng thái "Chờ duyệt". Quản lý có quyền duyệt hoặc từ chối đơn. Khi duyệt, hệ thống ghi nhận người duyệt và thời gian duyệt.

Đặc biệt với đơn xin nghỉ việc, khi được duyệt, hệ thống tự động cập nhật trạng thái nhân viên thành "Đã nghỉ việc" và vô hiệu hóa tài khoản của họ.

### 2.4 Quản lý Lương
Hệ thống hỗ trợ tính lương tự động theo tháng dựa trên:
- Lương cơ bản của nhân viên
- Phụ cấp
- Số ngày công thực tế (từ bảng chấm công)
- Số giờ tăng ca
- Các khoản thưởng
- Các khoản phạt (đi trễ, về sớm)

Quản lý có thể chạy tính lương cho một tháng cụ thể, hệ thống sẽ tự động tạo phiếu lương cho từng nhân viên. Sau đó có thể xem danh sách phiếu lương, in phiếu lương, và đánh dấu trạng thái đã trả lương.

Nhân viên có thể xem lịch sử lương của bản thân và in phiếu lương cá nhân.

---

## 3. QUẢN LÝ KHO HÀNG

### 3.1 Quản lý Sản phẩm
Hệ thống quản lý thông tin chi tiết của sách bao gồm: mã sách, tên sách, tác giả, thể loại, nhà xuất bản, năm xuất bản, ISBN, giá bán, giá nhập, trọng lượng, kích thước, số trang, và mô tả.

Mỗi sản phẩm có thể có nhiều hình ảnh. Nhân viên kho có thể thêm mới, chỉnh sửa thông tin sách, cập nhật giá bán, và đánh dấu ngừng kinh doanh khi sản phẩm không còn bán nữa.

### 3.2 Quản lý Tác giả và Thể loại
Hệ thống duy trì danh mục tác giả và thể loại sách riêng biệt. Mỗi tác giả có thông tin về tiểu sử, ảnh đại diện. Mỗi thể loại có tên và mô tả. Điều này giúp phân loại và tìm kiếm sách dễ dàng hơn.

### 3.3 Nhập kho
Khi nhập hàng từ nhà cung cấp, nhân viên kho tạo phiếu nhập kho ghi nhận:
- Thông tin nhà cung cấp
- Danh sách sản phẩm nhập (mã sách, số lượng, giá nhập)
- Chi nhánh nhập vào
- Ngày nhập
- Tổng giá trị đơn hàng

Sau khi tạo phiếu nhập, hệ thống tự động cập nhật số lượng tồn kho của từng sản phẩm tại chi nhánh tương ứng. Đồng thời tạo bản ghi công nợ phải trả cho nhà cung cấp nếu chưa thanh toán ngay.

### 3.4 Kiểm kê Kho
Nhân viên kho thực hiện kiểm kê định kỳ để đối chiếu số lượng thực tế với số liệu trên hệ thống. Quy trình:
1. Tạo phiếu kiểm kê cho một chi nhánh cụ thể
2. Nhập số lượng thực tế đếm được cho từng sản phẩm
3. Hệ thống tự động tính chênh lệch (thực tế - hệ thống)
4. Ghi chú lý do chênh lệch nếu có
5. Xác nhận kiểm kê
6. Hệ thống cập nhật tồn kho theo số liệu thực tế

### 3.5 Chuyển kho giữa Chi nhánh
Khi cần điều chuyển hàng giữa các chi nhánh, nhân viên tạo phiếu chuyển kho gồm:
- Chi nhánh xuất
- Chi nhánh nhận
- Danh sách sản phẩm và số lượng chuyển
- Lý do chuyển kho
- Ngày chuyển

Ban đầu phiếu ở trạng thái "Chờ duyệt". Quản lý kho duyệt phiếu, sau đó:
- Trừ tồn kho tại chi nhánh xuất
- Cộng tồn kho tại chi nhánh nhận
- Cập nhật trạng thái phiếu thành "Đã hoàn thành"

### 3.6 Cảnh báo Tồn kho
Hệ thống tự động cảnh báo khi sản phẩm sắp hết hàng (dưới ngưỡng tối thiểu) hoặc tồn kho quá nhiều (trên ngưỡng tối đa). Điều này giúp bộ phận mua hàng chủ động đặt hàng bổ sung hoặc tránh nhập quá nhiều gây ứ đọng vốn.

---

## 4. QUẢN LÝ NHÀ CUNG CẤP

### 4.1 Hồ sơ Nhà cung cấp
Hệ thống lưu trữ thông tin đầy đủ về nhà cung cấp: tên công ty, mã số thuế, địa chỉ, số điện thoại, email, người liên hệ, điều khoản thanh toán, và ghi chú.

Mỗi nhà cung cấp được gán trạng thái hoạt động. Khi ngừng hợp tác, có thể đánh dấu không hoạt động nhưng vẫn giữ lịch sử giao dịch.

### 4.2 Quản lý Công nợ
Hệ thống tự động tạo bản ghi công nợ khi:
- Nhập hàng chưa thanh toán đủ
- Trả hàng cho nhà cung cấp (giảm công nợ)

Mỗi bản ghi công nợ ghi nhận: nhà cung cấp, số tiền nợ, ngày phát sinh, nội dung, và trạng thái thanh toán.

Kế toán có thể:
- Xem tổng công nợ theo từng nhà cung cấp
- Xem chi tiết các khoản công nợ
- Ghi nhận thanh toán (toàn bộ hoặc từng phần)
- Xuất báo cáo công nợ theo kỳ

---

## 5. QUẢN LÝ CHI NHÁNH

### 5.1 Thông tin Chi nhánh
Hệ thống quản lý nhiều chi nhánh bán hàng. Mỗi chi nhánh có thông tin: tên chi nhánh, địa chỉ đầy đủ (tỉnh/thành, quận/huyện, phường/xã), số điện thoại, email, và trạng thái hoạt động.

### 5.2 Phân bổ Nhân viên và Tồn kho
Mỗi nhân viên được gán vào một chi nhánh cụ thể. Tồn kho được quản lý riêng biệt cho từng chi nhánh. Điều này cho phép theo dõi hiệu quả kinh doanh của từng điểm bán.

---

## 6. QUẢN LÝ KHÁCH HÀNG

### 6.1 Hồ sơ Khách hàng
Hệ thống ghi nhận thông tin khách hàng: họ tên, số điện thoại, email, địa chỉ, ngày sinh, giới tính. Mỗi khách hàng có mã khách hàng duy nhất.

Thông tin này được thu thập khi khách hàng mua hàng lần đầu hoặc đăng ký thẻ thành viên. Hỗ trợ cho các chương trình chăm sóc khách hàng và marketing.

### 6.2 Lịch sử Giao dịch
Hệ thống lưu trữ toàn bộ lịch sử mua hàng của khách hàng:
- Các hóa đơn đã mua
- Sản phẩm đã mua
- Tổng chi tiêu
- Tần suất mua hàng

Nhân viên có thể tra cứu lịch sử để hỗ trợ khách hàng tốt hơn.

### 6.3 Chương trình Khách hàng thân thiết
Hệ thống tích điểm tự động cho khách hàng dựa trên giá trị đơn hàng. Điểm tích lũy có thể dùng để đổi quà hoặc giảm giá cho các lần mua sau. Khách hàng được phân hạng theo mức chi tiêu (Đồng, Bạc, Vàng, Kim cương) với các ưu đãi khác nhau.

---

## 7. BÁN HÀNG (POS - POINT OF SALE)

### 7.1 Quy trình Bán hàng
Nhân viên bán hàng thực hiện giao dịch như sau:

**Bước 1: Tạo hóa đơn mới**
- Chọn hoặc thêm mới khách hàng (có thể bỏ qua nếu khách lẻ)
- Chọn chi nhánh bán (mặc định là chi nhánh của nhân viên)

**Bước 2: Thêm sản phẩm vào giỏ hàng**
- Tìm kiếm sản phẩm theo tên, mã hoặc quét mã vạch
- Nhập số lượng
- Hệ thống kiểm tra tồn kho tại chi nhánh
- Hiển thị giá bán, tính tạm tính

**Bước 3: Áp dụng Khuyến mãi/Giảm giá**
- Áp dụng mã giảm giá (nếu có)
- Giảm giá theo phần trăm hoặc số tiền
- Tính lại tổng tiền

**Bước 4: Thanh toán**
- Chọn phương thức: tiền mặt, chuyển khoản, thẻ
- Nhập số tiền khách đưa
- Tính tiền thừa trả lại
- Xác nhận thanh toán

**Bước 5: Hoàn tất**
- Hệ thống trừ tồn kho
- Lưu hóa đơn với trạng thái "Đã thanh toán"
- In hóa đơn cho khách hàng
- Cộng điểm tích lũy cho khách hàng (nếu có)

### 7.2 Quản lý Hóa đơn
Nhân viên và quản lý có thể:
- Xem danh sách hóa đơn theo ngày, tháng
- Tìm kiếm hóa đơn theo mã, khách hàng, nhân viên
- Xem chi tiết hóa đơn (sản phẩm, số lượng, giá)
- In lại hóa đơn
- Hủy hóa đơn (với lý do và phê duyệt)

Khi hủy hóa đơn, hệ thống hoàn lại số lượng vào kho.

---

## 8. TRẢ HÀNG

### 8.1 Quy trình Trả hàng
Khách hàng có thể trả hàng trong vòng một thời gian nhất định nếu sản phẩm lỗi hoặc không phù hợp.

**Bước 1: Tạo phiếu trả hàng**
- Nhập mã hóa đơn gốc
- Chọn sản phẩm cần trả và số lượng
- Ghi rõ lý do trả hàng
- Đính kèm hình ảnh nếu sản phẩm lỗi

**Bước 2: Kiểm tra**
Nhân viên kiểm tra:
- Hóa đơn có tồn tại và hợp lệ
- Trong thời hạn đổi trả
- Sản phẩm còn nguyên vẹn (nếu không lỗi)

**Bước 3: Duyệt trả hàng**
- Quản lý xem xét và duyệt phiếu trả
- Chọn hình thức hoàn tiền: tiền mặt, chuyển khoản, hoặc phiếu mua hàng

**Bước 4: Hoàn tiền**
- Tính số tiền hoàn lại (có thể trừ phí nếu không lỗi)
- Xác nhận đã hoàn tiền cho khách
- Cộng lại tồn kho (nếu sản phẩm còn bán được)
- Ghi nhận hàng hỏng (nếu sản phẩm lỗi)

---

## 9. BÁO CÁO VÀ THỐNG KÊ

### 9.1 Báo cáo Doanh thu
Hệ thống cung cấp báo cáo doanh thu linh hoạt:

**Theo thời gian:**
- Doanh thu theo năm: Tổng doanh thu mỗi năm
- Doanh thu theo tháng: Doanh thu từng tháng trong năm được chọn
- Doanh thu theo ngày: Doanh thu từng ngày trong tháng được chọn
- Doanh thu theo khoảng thời gian: Tùy chọn từ ngày đến ngày

**Theo chi nhánh:**
- So sánh doanh thu giữa các chi nhánh
- Xếp hạng chi nhánh theo doanh thu

**Theo sản phẩm:**
- Top sản phẩm bán chạy
- Doanh thu theo thể loại sách
- Doanh thu theo tác giả

**Theo nhân viên:**
- Doanh thu do từng nhân viên tạo ra
- Xếp hạng nhân viên bán hàng

Tất cả báo cáo đều có thể xuất ra Excel hoặc PDF để lưu trữ và phân tích.

### 9.2 Báo cáo Tồn kho
- Tồn kho hiện tại theo chi nhánh
- Tồn kho theo thể loại
- Sách sắp hết hàng
- Sách tồn kho lâu
- Giá trị hàng tồn kho

### 9.3 Báo cáo Công nợ
- Tổng công nợ phải trả nhà cung cấp
- Chi tiết công nợ theo nhà cung cấp
- Lịch sử thanh toán
- Công nợ quá hạn

### 9.4 Báo cáo Nhân sự
- Tổng hợp công theo tháng
- Báo cáo lương
- Thống kê nghỉ phép
- Tỷ lệ đi trễ, về sớm

### 9.5 Dashboard Tổng quan
Trang chủ hiển thị các chỉ số quan trọng:
- Doanh thu hôm nay, tuần này, tháng này
- Số đơn hàng
- Số khách hàng mới
- Cảnh báo tồn kho
- Nhân viên chấm công hôm nay
- Đơn nghỉ phép chờ duyệt
- Công nợ cần thanh toán

---

## 10. QUẢN LÝ HỆ THỐNG

### 10.1 Nhật ký Hoạt động (Audit Log)
Hệ thống ghi nhận tất cả hoạt động quan trọng:
- Ai đã làm gì
- Trên dữ liệu nào
- Vào thời gian nào
- Từ địa chỉ IP nào

Điều này đảm bảo tính minh bạch và truy vết khi có sự cố.

### 10.2 Sao lưu và Phục hồi
Hệ thống hỗ trợ sao lưu dữ liệu định kỳ (hàng ngày, hàng tuần). Quản trị viên có thể tải xuống file sao lưu hoặc phục hồi từ bản sao lưu trước đó khi cần.

### 10.3 Cấu hình Hệ thống
Quản trị viên có thể cấu hình:
- Thông tin công ty (tên, logo, địa chỉ, số điện thoại)
- Chính sách bán hàng (thời gian đổi trả, chiết khấu tối đa)
- Cấu hình tích điểm khách hàng
- Múi giờ và định dạng ngày tháng
- Cấu hình email (SMTP)
- Cấu hình thanh toán online

---

## 11. TÍCH HỢP VÀ MỞ RỘNG

### 11.1 API
Hệ thống cung cấp RESTful API cho phép tích hợp với các hệ thống khác:
- Website bán hàng online
- Ứng dụng mobile
- Hệ thống kế toán bên ngoài
- Các công cụ marketing

### 11.2 Xuất/Nhập Dữ liệu
Hỗ trợ xuất dữ liệu ra Excel, CSV để phân tích hoặc chuyển sang hệ thống khác. Có thể nhập hàng loạt sản phẩm, khách hàng từ file Excel.

---

## 12. BẢO MẬT VÀ TUÂN THỦ

### 12.1 Bảo mật Dữ liệu
- Mật khẩu được mã hóa bằng bcrypt
- Truyền dữ liệu qua HTTPS
- Token xác thực có thời hạn
- Phân quyền chặt chẽ theo vai trò

### 12.2 Tuân thủ Pháp luật
- Hóa đơn điện tử tuân thủ quy định về thuế
- Bảo vệ dữ liệu cá nhân theo luật
- Lưu trữ hóa đơn đủ thời gian theo quy định

---

## KẾT LUẬN

Hệ thống Quản lý Bán sách Offline được thiết kế để đáp ứng đầy đủ nhu cầu vận hành của một chuỗi cửa hàng bán sách, từ quản lý nhân sự, kho hàng, bán hàng đến báo cáo phân tích. 

Với giao diện thân thiện, quy trình rõ ràng và tính năng phong phú, hệ thống giúp tối ưu hóa hoạt động kinh doanh, giảm thiểu sai sót, nâng cao trải nghiệm khách hàng và cung cấp thông tin chính xác để ra quyết định quản lý hiệu quả.
