import { message } from 'antd';

/**
 * Xử lý lỗi API trong catch blocks.
 *
 * - Nếu lỗi 403 (không có quyền): interceptor toàn cục trong App.js đã hiển thị
 *   "Bạn không có quyền thực hiện chức năng này!" nên bỏ qua ở đây.
 * - Các lỗi khác: hiển thị fallbackMsg.
 *
 * @param {Error} error  - Error object từ axios
 * @param {string} fallbackMsg - Thông báo hiển thị khi không phải 403
 */
export const handleApiError = (error, fallbackMsg) => {
  if (error?.response?.status === 403) return; // Đã xử lý bởi global interceptor

  const msg =
    fallbackMsg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Đã xảy ra lỗi';

  message.error(msg);
};
