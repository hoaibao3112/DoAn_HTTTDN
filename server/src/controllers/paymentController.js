import crypto from 'crypto';
import dayjs from 'dayjs';
import pool from '../config/connectDatabase.js';
import axios from 'axios';
import qs from 'qs';

/**
 * Helper: Sắp xếp object theo thứ tự bảng chữ cái của key và URL encode
 * Theo yêu cầu của VNPAY 2.1.0
 */
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const paymentController = {
    // =======================Chức năng thanh toán======================
    // ======================= VNPAY INTEGRATION =======================
    createVNPayUrl: async (req, res) => {
        try {
            const { amount, orderId, orderInfo, bankCode } = req.body;

            const tmnCode = process.env.VNPAY_TMN_CODE;
            const secretKey = process.env.VNPAY_HASH_SECRET;
            let vnpUrl = process.env.VNPAY_URL;
            const returnUrl = process.env.VNP_RETURN_URL;
            const hashAlgorithm = process.env.VNPAY_HASH_ALGORITHM?.toLowerCase() || 'sha512';

            const date = new Date();
            const createDate = dayjs(date).format('YYYYMMDDHHmmss');

            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            let vnp_Params = {};
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = 'vn';
            vnp_Params['vnp_CurrCode'] = 'VND';
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = orderInfo || 'Thanh toan hoa don POS';
            vnp_Params['vnp_OrderType'] = 'other';
            vnp_Params['vnp_Amount'] = amount * 100;
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;
            if (bankCode) {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            // Sắp xếp tham số
            vnp_Params = sortObject(vnp_Params);

            // Tạo chuỗi hash
            const signData = qs.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac(hashAlgorithm, secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            // Build URL
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

            res.json({ success: true, paymentUrl: vnpUrl });
        } catch (error) {
            console.error('VNPay Create Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    vnpayReturn: async (req, res) => {
        try {
            let vnp_Params = req.query;
            const secureHash = vnp_Params['vnp_SecureHash'];

            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);

            const secretKey = process.env.VNPAY_HASH_SECRET;
            const hashAlgorithm = process.env.VNPAY_HASH_ALGORITHM?.toLowerCase() || 'sha512';
            const signData = qs.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac(hashAlgorithm, secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                // Ký đúng -> Kiểm tra trạng thái giao dịch
                const responseCode = vnp_Params['vnp_ResponseCode'];
                const orderId = vnp_Params['vnp_TxnRef'];

                if (responseCode === "00") {
                    // Cập nhật trạng thái trong trường hợp IPN chưa kịp cập nhật hoặc redirect nhanh hơn
                    await pool.query('UPDATE hoadon SET TrangThai = "Hoan_thanh" WHERE MaHD = ? AND TrangThai = "Chua_thanh_toan"', [orderId]);
                    
                    // Redirect về frontend với thông tin thành công
                    return res.redirect(`${process.env.CLIENT_ADMIN_URL || 'http://localhost:3000'}/admin/pos?vnp_ResponseCode=00&vnp_TxnRef=${orderId}`);
                } else {
                    return res.redirect(`${process.env.CLIENT_ADMIN_URL || 'http://localhost:3000'}/admin/pos?vnp_ResponseCode=${responseCode}&vnp_TxnRef=${orderId}`);
                }
            } else {
                res.status(400).send("<h1>Lỗi chữ ký!</h1><p>Dữ liệu phản hồi không hợp lệ.</p>");
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    },

    vnpayIpn: async (req, res) => {
        // IPN handles background update (highly recommended for reliability)
        try {
            let vnp_Params = req.query;
            const secureHash = vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            vnp_Params = sortObject(vnp_Params);
            const secretKey = process.env.VNPAY_HASH_SECRET;
            const signData = qs.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash === signed) {
                const orderId = vnp_Params['vnp_TxnRef'];
                const responseCode = vnp_Params['vnp_ResponseCode'];
                
                if (responseCode === "00") {
                    // Cập nhật Database: Đã thanh toán
                    await pool.query('UPDATE hoadon SET TrangThai = "Hoan_thanh" WHERE MaHD = ?', [orderId]);
                    console.log(`[VNPAY IPN] Payment success for order ${orderId}`);
                } else {
                    // Có thể cập nhật là đã hủy hoặc lỗi nếu muốn
                    console.log(`[VNPAY IPN] Payment failed for order ${orderId}, Code: ${responseCode}`);
                }
                res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
            } else {
                res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
            }
        } catch (error) {
            res.status(200).json({ RspCode: '99', Message: 'Unknown Error' });
        }
    },

    // ======================= MOMO INTEGRATION =======================
    createMoMoPayment: async (req, res) => {
        try {
            const { amount, orderId, orderInfo } = req.body;

            const partnerCode = process.env.MOMO_PARTNER_CODE;
            const accessKey = process.env.MOMO_ACCESS_KEY;
            const secretKey = process.env.MOMO_SECRET_KEY;
            const endpoint = process.env.MOMO_API_URL;
            const redirectUrl = process.env.MOMO_REDIRECT_URL;
            const ipnUrl = process.env.MOMO_IPN_URL;
            const requestId = orderId;
            const requestType = "captureWallet";
            const extraData = ""; // optional

            const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;

            const signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            const requestBody = {
                partnerCode,
                requestId,
                amount,
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                requestType,
                extraData,
                signature,
                lang: 'vi'
            };

            const response = await axios.post(endpoint, requestBody);
            res.json({ success: true, paymentUrl: response.data.payUrl, qrCodeUrl: response.data.qrCodeUrl });
        } catch (error) {
            console.error('MoMo Create Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ======================= ZALOPAY INTEGRATION =======================
    createZaloPayPayment: async (req, res) => {
        try {
            const { amount, orderId, orderInfo } = req.body;

            const config = {
                app_id: process.env.ZALOPAY_APP_ID,
                key1: process.env.ZALOPAY_KEY1,
                key2: process.env.ZALOPAY_KEY2,
                endpoint: process.env.ZALOPAY_ENDPOINT
            };

            const embed_data = {};
            const items = [{}];
            const transID = Math.floor(Math.random() * 1000000);
            const order = {
                app_id: config.app_id,
                app_trans_id: `${dayjs().format('YYMMDD')}_${orderId}_${transID}`,
                app_user: "pos_user",
                app_time: Date.now(),
                item: JSON.stringify(items),
                embed_data: JSON.stringify(embed_data),
                amount: amount,
                description: orderInfo || `Thanh toan hoa don #${orderId}`,
                bank_code: "zalopayapp"
            };

            const data = order.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
            order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

            const response = await axios.post(config.endpoint, null, { params: order });
            res.json({ success: true, paymentUrl: response.data.order_url });
        } catch (error) {
            console.error('ZaloPay Create Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default paymentController;
