import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import html2pdf from 'html2pdf.js';
import { PermissionContext } from '../components/PermissionContext';
import { FEATURES } from '../constants/permissions';
import '../styles/POSPage.css';

const POSPage = () => {
    const { hasPermissionById } = useContext(PermissionContext);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [customerGiven, setCustomerGiven] = useState('');
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        TenKH: '',
        SDT: '',
        Email: '',
        DiaChi: ''
    });
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // KHUYẾN MÃI
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [voucherCode, setVoucherCode] = useState('');

    // BARCODE SCANNER
    const [showScanner, setShowScanner] = useState(false);
    const [manualISBN, setManualISBN] = useState('');
    const [scannerStatus, setScannerStatus] = useState('Sẵn sàng quét...');
    const scannerRef = useRef(null);
    const html5QrcodeScannerRef = useRef(null);
    const [showPromotions, setShowPromotions] = useState(false);
    const [promotionDiscount, setPromotionDiscount] = useState(0);

    // INVOICE RECEIPT
    const [showInvoiceReceipt, setShowInvoiceReceipt] = useState(false);
    const [completedInvoice, setCompletedInvoice] = useState(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const cashierName = userInfo.HoTen || 'Nguyễn Văn A';
    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        checkOpenSession().then(sess => fetchProducts(sess?.MaCH));
        fetchCategories();
    }, []);

    // Kiểm tra khuyến mãi tự động khi giỏ hàng thay đổi
    useEffect(() => {
        if (cart.length > 0) {
            checkAvailablePromotions();
        } else {
            setAvailablePromotions([]);
            setSelectedPromotion(null);
            setPromotionDiscount(0);
        }
    }, [cart]);

    const getImageUrl = (path) => {
        if (!path) return '/placeholder-book.jpg';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    };

    const checkOpenSession = async () => {
        const savedSession = localStorage.getItem('posSession');
        if (savedSession) {
            const sess = JSON.parse(savedSession);
            setSession(sess);
            return sess;
        }
        return null;
    };

    // Lấy tồn kho kho quầy (Priority=1) và gắn SoLuong vào products
    const fetchStockByBranch = async (MaCH, productList) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.get(
                `http://localhost:5000/api/warehouse/counter-stock?MaCH=${MaCH}&pageSize=1000`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                const stockMap = {};
                (res.data.data || []).forEach(s => { stockMap[s.MaSP] = s.SoLuongTon; });
                return (productList || []).map(p => ({
                    ...p,
                    SoLuong: stockMap[p.MaSP] ?? 0  // tồn kho tại kho quầy
                }));
            }
        } catch (e) {
            console.error('Error fetching counter stock:', e);
        }
        return (productList || []).map(p => ({ ...p, SoLuong: 0 }));
    };

    const fetchProducts = async (MaCH) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/warehouse/products?pageSize=500', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.data) {
                const raw = response.data.data.items || response.data.data;
                // Luôn dùng kho quầy (Priority=1), mặc định MaCH=1 nếu chưa có session
                const branchId = MaCH || session?.MaCH || 1;
                const merged = await fetchStockByBranch(branchId, raw);
                setProducts(merged);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/catalog/categories');
            setCategories(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // =============== KHUYẾN MÃI ===============

    const checkAvailablePromotions = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/promotions/check-available',
                {
                    MaCH: session?.MaCH || 1,
                    TongTien: calculateSubtotal(),
                    MaKH: customer?.MaKH || null,
                    ChiTiet: cart.map(item => ({
                        MaSP: item.MaSP,
                        DonGia: item.DonGia,
                        SoLuong: item.quantity
                    }))
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data) {
                setAvailablePromotions(response.data.data);

                // Tự động chọn khuyến mãi tốt nhất (đầu tiên)
                if (response.data.data.length > 0 && !selectedPromotion) {
                    const bestPromo = response.data.data[0];
                    setSelectedPromotion(bestPromo);
                    setPromotionDiscount(bestPromo.giaTriGiamDuKien || 0);
                }
            }
        } catch (error) {
            console.error('Error checking promotions:', error);
        }
    };

    const applyVoucherCode = async () => {
        if (!voucherCode.trim()) {
            alert('Vui lòng nhập mã giảm giá!');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                'http://localhost:5000/api/promotions/validate-voucher',
                {
                    MaCode: voucherCode.toUpperCase(),
                    MaCH: session?.MaCH || 1,
                    TongTien: calculateSubtotal(),
                    MaKH: customer?.MaKH || null,
                    ChiTiet: cart.map(item => ({
                        MaSP: item.MaSP,
                        DonGia: item.DonGia,
                        SoLuong: item.quantity
                    }))
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const promoData = response.data.data;
                setSelectedPromotion(promoData);
                setPromotionDiscount(promoData.GiaTriGiam || 0);
                setVoucherCode('');
                alert(`Áp dụng mã thành công! Giảm ${promoData.GiaTriGiam.toLocaleString()}đ`);
                setShowPromotions(false);
            }
        } catch (error) {
            console.error('Error applying voucher:', error);
            alert(error.response?.data?.message || 'Mã giảm giá không hợp lệ!');
        }
    };

    const selectPromotion = (promo) => {
        setSelectedPromotion(promo);
        setPromotionDiscount(promo.giaTriGiamDuKien || 0);
        setShowPromotions(false);
    };

    const removePromotion = () => {
        setSelectedPromotion(null);
        setPromotionDiscount(0);
        setVoucherCode('');
    };

    // =============== BARCODE SCANNER ===============

    const searchProductByISBN = async (isbn) => {
        try {
            setScannerStatus(`Đang tìm sản phẩm ISBN: ${isbn}...`);
            const token = localStorage.getItem('authToken');

            // Chuẩn hóa ISBN (xóa dấu gạch ngang, khoảng trắng)
            const normalizedISBN = isbn.replace(/[-\s]/g, '').trim();

            // Tìm sản phẩm theo ISBN từ backend
            const response = await axios.get(
                `http://localhost:5000/api/warehouse/products?search=${isbn}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data) {
                const items = response.data.data.items || response.data.data;
                // Tìm sản phẩm có ISBN khớp chính xác (sau khi chuẩn hóa)
                const product = Array.isArray(items)
                    ? items.find(p => p.ISBN && p.ISBN.replace(/[-\s]/g, '').trim() === normalizedISBN)
                    : null;

                if (product) {
                    addToCart(product);
                    setScannerStatus(`✓ Đã thêm: ${product.TenSP}`);
                    setTimeout(() => {
                        closeBarcodeScanner();
                    }, 1500);
                    return true;
                } else {
                    setScannerStatus(`✗ Không tìm thấy sản phẩm với ISBN: ${isbn}`);
                    return false;
                }
            }
        } catch (error) {
            console.error('Error searching product by ISBN:', error);
            setScannerStatus(`✗ Lỗi tìm kiếm: ${error.message}`);
            return false;
        }
    };

    const handleBarcodeScanned = (decodedText) => {
        console.log('Barcode scanned:', decodedText);

        // Dừng scanner ngay lập tức để không quét lại
        if (html5QrcodeScannerRef.current) {
            html5QrcodeScannerRef.current.stop().then(() => {
                html5QrcodeScannerRef.current = null;
            }).catch(err => console.error('Error stopping scanner:', err));
        }

        // Tìm và thêm sản phẩm
        searchProductByISBN(decodedText);
        closeBarcodeScanner();
    };

    const toggleBarcodeScanner = () => {
        if (showScanner) {
            closeBarcodeScanner();
        } else {
            openBarcodeScanner();
        }
    };

    const openBarcodeScanner = () => {
        setShowScanner(true);
        setScannerStatus('Đang khởi động camera...');
        setManualISBN('');

        // Delay để đảm bảo DOM đã render
        setTimeout(async () => {
            if (scannerRef.current && !html5QrcodeScannerRef.current) {
                try {
                    const scanner = new Html5Qrcode("barcode-reader");
                    
                    // Tự động start camera khi mở modal
                    await scanner.start(
                        { facingMode: "environment" }, // Camera sau
                        {
                            fps: 10,
                            qrbox: { width: 300, height: 150 },
                            // Thêm config để quét tất cả loại barcode
                            formatsToSupport: [
                                Html5QrcodeSupportedFormats.QR_CODE,
                                Html5QrcodeSupportedFormats.CODE_128,
                                Html5QrcodeSupportedFormats.CODE_39,
                                Html5QrcodeSupportedFormats.EAN_13,
                                Html5QrcodeSupportedFormats.EAN_8,
                                Html5QrcodeSupportedFormats.UPC_A,
                                Html5QrcodeSupportedFormats.UPC_E
                            ]
                        },
                        (decodedText) => handleBarcodeScanned(decodedText),
                        (error) => {
                            // Không log mỗi lỗi quét vì sẽ spam console
                            if (error?.includes('NotFoundException') === false) {
                                console.warn('Scanner error:', error);
                            }
                        }
                    );

                    html5QrcodeScannerRef.current = scanner;
                    setScannerStatus('✓ Camera đã sẵn sàng! Đưa mã vạch vào khung hình...');
                } catch (error) {
                    console.error('Error initializing scanner:', error);
                    setScannerStatus('✗ Lỗi khởi động camera: ' + error.message);
                }
            }
        }, 100);
    };

    const closeBarcodeScanner = () => {
        if (html5QrcodeScannerRef.current) {
            try {
                // Dừng scanning trước, sau đó mới clear
                html5QrcodeScannerRef.current.stop().then(() => {
                    html5QrcodeScannerRef.current = null;
                    setShowScanner(false);
                    setScannerStatus('Sẵn sàng quét...');
                }).catch(err => {
                    console.error('Error stopping scanner:', err);
                    html5QrcodeScannerRef.current = null;
                    setShowScanner(false);
                    setScannerStatus('Sẵn sàng quét...');
                });
            } catch (err) {
                console.error('Error stopping scanner:', err);
                html5QrcodeScannerRef.current = null;
                setShowScanner(false);
                setScannerStatus('Sẵn sàng quét...');
            }
        } else {
            setShowScanner(false);
            setScannerStatus('Sẵn sàng quét...');
        }
    };

    const handleManualISBNSubmit = () => {
        if (!manualISBN.trim()) {
            alert('Vui lòng nhập mã ISBN!');
            return;
        }
        searchProductByISBN(manualISBN.trim());
    };

    // Cleanup scanner khi unmount
    useEffect(() => {
        return () => {
            if (html5QrcodeScannerRef.current) {
                html5QrcodeScannerRef.current.stop().catch(err =>
                    console.error('Error stopping scanner on unmount:', err)
                );
            }
        };
    }, []);

    const searchCustomer = async () => {
        if (!customerSearch.trim()) return;

        try {
            const token = localStorage.getItem('authToken');
            // Use /api/customers with search parameter
            const response = await axios.get(
                `http://localhost:5000/api/customers?search=${customerSearch}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data && response.data.data.length > 0) {
                // Take first match - Database returns uppercase field names
                const foundCustomer = response.data.data[0];
                setCustomer({
                    MaKH: foundCustomer.MaKH,
                    HoTen: foundCustomer.HoTen,
                    SDT: foundCustomer.SDT,
                    Email: foundCustomer.Email,
                    DiemTichLuy: foundCustomer.DiemTichLuy || 0,
                    TongDiemTichLuy: foundCustomer.TongDiemTichLuy || 0,
                    HangTV: foundCustomer.HangTV,
                    ...foundCustomer
                });
                setCustomerSearch(''); // Clear search field after finding
                alert(`Tìm thấy khách hàng: ${foundCustomer.HoTen}`);
            } else {
                alert('Không tìm thấy khách hàng. Vui lòng tạo mới.');
                setShowCustomerForm(true);
                setNewCustomer({ ...newCustomer, SDT: customerSearch });
            }
        } catch (error) {
            console.error('Error searching customer:', error);
            alert('Lỗi tìm khách hàng: ' + (error.response?.data?.message || error.message));
        }
    };

    const createCustomer = async () => {
        if (!newCustomer.TenKH || !newCustomer.SDT) {
            alert('Vui lòng nhập tên và SĐT của khách hàng!');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            // Use /api/customers endpoint - Database expects uppercase field names
            const payload = {
                HoTen: newCustomer.TenKH,
                SDT: newCustomer.SDT,
                Email: newCustomer.Email,
                DiaChi: newCustomer.DiaChi
            };

            const response = await axios.post(
                'http://localhost:5000/api/customers',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const createdCustomer = response.data.data;
                setCustomer({
                    MaKH: createdCustomer.MaKH,
                    HoTen: createdCustomer.HoTen,
                    SDT: createdCustomer.SDT,
                    Email: createdCustomer.Email,
                    DiemTichLuy: 0,
                    TongDiemTichLuy: 0,
                    HangTV: 'Dong'
                });
                setShowCustomerForm(false);
                setNewCustomer({ TenKH: '', SDT: '', Email: '', DiaChi: '' });
                alert('Tạo khách hàng thành công!');
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            const errorMsg = error.response?.data?.message || error.message;
            alert('Lỗi tạo khách hàng: ' + errorMsg);
        }
    };

    const addToCart = (product) => {
        if (product.SoLuong <= 0) {
            alert(`"${product.TenSP}" đã hết hàng tại kho quầy! Vui lòng chuyển kho trước.`);
            return;
        }

        const existing = cart.find(item => item.MaSP === product.MaSP);
        if (existing) {
            if (existing.quantity >= product.SoLuong) {
                alert(`Kho quầy chỉ còn ${product.SoLuong} cuốn "${product.TenSP}". Chuyển kho để bổ sung thêm.`);
                return;
            }
            setCart(cart.map(item =>
                item.MaSP === product.MaSP
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p.MaSP === productId);
        const maxQty = product?.SoLuong || 9999;
        const qty = Math.min(parseInt(newQuantity) || 1, maxQty);

        if (parseInt(newQuantity) > maxQty) {
            alert(`Kho quầy chỉ còn ${maxQty} cuốn "${product?.TenSP}". Chuyển kho để bổ sung thêm.`);
        }

        setCart(cart.map(item =>
            item.MaSP === productId
                ? { ...item, quantity: qty }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.MaSP !== productId));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.DonGia * item.quantity), 0);
    };

    const calculateDiscount = () => {
        // Tính giảm giá từ khuyến mãi
        return promotionDiscount || 0;
    };

    const calculateTax = () => {
        return (calculateSubtotal() - calculateDiscount()) * 0; // Tạm thời 0% VAT
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount() + calculateTax();
    };

    const calculateChange = () => {
        const given = parseFloat(customerGiven) || 0;
        const total = calculateTotal();
        return Math.max(0, given - total);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        if (paymentMethod === 'cash' && (!customerGiven || parseFloat(customerGiven) < calculateTotal())) {
            alert('Số tiền khách đưa không đủ!');
            return;
        }

        setLoading(true);

        // Handle Online Payment first
        if (['vnpay', 'momo', 'zalopay'].includes(paymentMethod)) {
            try {
                const token = localStorage.getItem('authToken');
                const total = calculateTotal();
                const tempOrderId = `POS_${Date.now()}`;

                const res = await axios.post(`http://localhost:5000/api/payments/${paymentMethod}/create`, {
                    amount: total,
                    orderId: tempOrderId,
                    orderInfo: `Thanh toán đơn hàng POS ${tempOrderId}`
                }, { headers: { Authorization: `Bearer ${token}` } });

                if (res.data.success && res.data.paymentUrl) {
                    // Open payment window
                    window.open(res.data.paymentUrl, '_blank');

                    // In a real system, you'd wait for a socket event or poll for completion.
                    // For this demo, we'll ask the user if they've paid.
                    if (window.confirm("Hãy xác nhận sau khi khách hàng đã thanh toán thành công qua ứng dụng?")) {
                        // Proceed to create invoice as 'Online'
                    } else {
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error(`Error creating ${paymentMethod} payment:`, error);
                alert(`Lỗi khởi tạo ${paymentMethod}: ` + (error.response?.data?.message || error.message));
                setLoading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem('authToken');

            const invoiceData = {
                MaKH: customer?.MaKH || null,
                MaCH: session?.MaCH || 1, // Use session branch or default to 1
                MaPhien: session?.MaPhien || null,
                ChiTiet: cart.map(item => ({
                    MaSP: item.MaSP,
                    SoLuong: item.quantity,
                    DonGia: item.DonGia,
                    GiamGia: 0
                })),
                GiamGia: promotionDiscount || 0,
                DiemSuDung: 0,
                PhuongThucTT: paymentMethod === 'cash' ? 'Tien_mat' :
                    paymentMethod === 'vnpay' ? 'VNPay' :
                        paymentMethod === 'momo' ? 'MoMo' :
                            paymentMethod === 'zalopay' ? 'ZaloPay' : 'The',
                TienKhachDua: parseFloat(customerGiven) || calculateTotal()
            };

            const response = await axios.post(
                'http://localhost:5000/api/sales/invoices',
                invoiceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const MaHD = response.data.MaHD;

                // Lưu lịch sử khuyến mãi (nếu có)
                if (selectedPromotion && promotionDiscount > 0) {
                    try {
                        await axios.post(
                            'http://localhost:5000/api/promotions/save-usage',
                            {
                                MaHD: MaHD,
                                MaKM: selectedPromotion.MaKM,
                                MaMGG: selectedPromotion.MaMGG || null,
                                MaKH: customer?.MaKH || null,
                                LoaiKM: selectedPromotion.LoaiKM,
                                GiaTriGiam: promotionDiscount,
                                TongTienTruocGiam: calculateSubtotal(),
                                TongTienSauGiam: calculateTotal()
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } catch (promoError) {
                        console.error('Error saving promotion usage:', promoError);
                    }
                }

                // Show success notification first
                setShowSuccessNotification(true);

                // Prepare invoice data for display
                const invoiceDetails = {
                    MaHD: MaHD,
                    NgayBan: new Date().toLocaleString('vi-VN'),
                    NhanVien: cashierName,
                    KhachHang: customer?.HoTen || customer?.TenKH || 'Khách lẻ',
                    SDT: customer?.SDT || '',
                    items: cart.map(item => ({
                        TenSP: item.TenSP,
                        SoLuong: item.quantity,
                        DonGia: item.DonGia,
                        ThanhTien: item.DonGia * item.quantity
                    })),
                    TongTien: calculateSubtotal(),
                    GiamGia: promotionDiscount,
                    ThanhToan: calculateTotal(),
                    PhuongThucTT: paymentMethod === 'cash' ? 'Tiền mặt' :
                        paymentMethod === 'vnpay' ? 'VNPay' :
                        paymentMethod === 'momo' ? 'MoMo' :
                        paymentMethod === 'zalopay' ? 'ZaloPay' : 'Thẻ',
                    TienKhachDua: parseFloat(customerGiven) || calculateTotal(),
                    TienThua: paymentMethod === 'cash' ? calculateChange() : 0
                };

                // Wait for notification animation, then show invoice
                setTimeout(() => {
                    setShowSuccessNotification(false);
                    setCompletedInvoice(invoiceDetails);
                    setShowInvoiceReceipt(true);
                }, 1500);

                // Reset cart and form
                setCart([]);
                setCustomer(null);
                setCustomerSearch('');
                setCustomerGiven('');
                setPaymentMethod('cash');
                setSelectedPromotion(null);
                setPromotionDiscount(0);
                setVoucherCode('');
                setAvailablePromotions([]);
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Lỗi thanh toán: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const printReceipt = () => {
        const printContent = document.getElementById('invoice-receipt-print');
        if (!printContent) return;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `HoaDon_${completedInvoice?.MaHD || 'HD'}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(printContent).save();
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.MaSP?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.MaTL === parseInt(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    if (!hasPermissionById(FEATURES.POS, 'xem')) {
        return (
            <div className="no-permission">
                <span className="material-icons">lock</span>
                <h2>Không có quyền truy cập</h2>
                <p>Bạn không có quyền sử dụng POS</p>
            </div>
        );
    }

    return (
        <div className="pos-page">
            {/* Header */}
            <header className="pos-header">
                <div className="pos-brand">
                    <span className="material-icons">store</span>
                    <h1>Bookstore POS</h1>
                </div>

                <div className="cashier-info">
                    <span className="cashier-name">Nhân viên: {cashierName}</span>
                    <button className="btn-icon">
                        <span className="material-icons">account_circle</span>
                    </button>
                    <button className="btn-icon">
                        <span className="material-icons">exit_to_app</span>
                    </button>
                </div>
            </header>

            <div className="pos-content">
                {/* Left Side - Cart & Checkout */}
                <div className="pos-side-cart">
                    <div className="cart-section">
                        <div className="cart-header">
                            <h3>GIỎ HÀNG</h3>
                            <div className="cart-stats">
                                <span>SL</span>
                                <span>ĐƠN GIÁ</span>
                                <span>T.TIỀN</span>
                            </div>
                        </div>

                        <div className="cart-items">
                            {cart.length > 0 ? (
                                cart.map(item => (
                                    <div key={item.MaSP} className="cart-item">
                                        <div className="item-details">
                                            <h4>{item.TenSP}</h4>
                                            <p className="item-code">{item.MaSP}</p>
                                        </div>
                                        <div className="item-controls">
                                            <div className="item-image-mini">
                                                <img src={getImageUrl(item.HinhAnh || item.Anh)} alt={item.TenSP} />
                                            </div>
                                            <div className="item-quantity">
                                                <button onClick={() => updateQuantity(item.MaSP, item.quantity - 1)}>−</button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.MaSP, e.target.value)}
                                                />
                                                <button onClick={() => updateQuantity(item.MaSP, item.quantity + 1)}>+</button>
                                            </div>
                                            <div className="item-prices">
                                                <span className="item-price">{item.DonGia?.toLocaleString()}đ</span>
                                                <span className="item-total">{(item.DonGia * item.quantity).toLocaleString()}đ</span>
                                            </div>
                                        </div>
                                        <button className="item-remove" onClick={() => removeFromCart(item.MaSP)}>
                                            <span className="material-icons">delete_outline</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="cart-empty">
                                    <p>Giỏ hàng trống...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="checkout-area">
                        {/* Customer Section */}
                        <div className="customer-section compact">
                            <div className="customer-search-box">
                                <span className="material-icons">person_search</span>
                                <input
                                    type="text"
                                    placeholder="Nhập SĐT khách hàng..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                                />
                                <button 
                                    className="btn-search-customer"
                                    onClick={searchCustomer}
                                    title="Tìm kiếm khách hàng"
                                >
                                    <span className="material-icons">search</span>
                                </button>
                                <button 
                                    className="btn-add-mini" 
                                    onClick={() => setShowCustomerForm(!showCustomerForm)}
                                    title="Tạo khách hàng mới"
                                >
                                    <span className="material-icons">add</span>
                                </button>
                            </div>

                            {customer && (
                                <div className="customer-info-mini">
                                    <span>{customer.HoTen || customer.TenKH}</span>
                                    <span className="mini-points">{customer.DiemTichLuy || 0}đ</span>
                                    <button onClick={() => setCustomer(null)}><span className="material-icons">close</span></button>
                                </div>
                            )}

                            {showCustomerForm && (
                                <div className="quick-customer-form mini">
                                    <input 
                                        type="text" 
                                        placeholder="Tên khách hàng *"
                                        value={newCustomer.TenKH} 
                                        onChange={(e) => setNewCustomer({ ...newCustomer, TenKH: e.target.value })}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="SĐT *"
                                        value={newCustomer.SDT} 
                                        onChange={(e) => setNewCustomer({ ...newCustomer, SDT: e.target.value })}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Email (tùy chọn)"
                                        value={newCustomer.Email} 
                                        onChange={(e) => setNewCustomer({ ...newCustomer, Email: e.target.value })}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Địa chỉ (tùy chọn)"
                                        value={newCustomer.DiaChi} 
                                        onChange={(e) => setNewCustomer({ ...newCustomer, DiaChi: e.target.value })}
                                    />
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                        <button onClick={createCustomer} style={{ flex: 1, background: '#52c41a', color: 'white' }}>Lưu</button>
                                        <button onClick={() => {
                                            setShowCustomerForm(false);
                                            setNewCustomer({ TenKH: '', SDT: '', Email: '', DiaChi: '' });
                                        }} style={{ flex: 1, background: '#f5f5f5', color: '#666' }}>Hủy</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Totals & Payments */}
                        <div className="totals-section">
                            <div className="total-row">
                                <span>Tổng cộng</span>
                                <span className="total-value">{calculateSubtotal().toLocaleString()}đ</span>
                            </div>

                            {/* Khuyến mãi Section */}
                            <div className="promotion-section">
                                <div className="promotion-header">
                                    <span className="material-icons">local_offer</span>
                                    <span>Khuyến mãi</span>
                                    <button
                                        className="btn-toggle-promotions"
                                        onClick={() => setShowPromotions(!showPromotions)}
                                    >
                                        <span className="material-icons">
                                            {showPromotions ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>
                                </div>

                                {showPromotions && (
                                    <div className="promotion-panel">
                                        {/* Nhập mã giảm giá */}
                                        <div className="voucher-input-box">
                                            <input
                                                type="text"
                                                placeholder="Nhập mã giảm giá..."
                                                value={voucherCode}
                                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                onKeyPress={(e) => e.key === 'Enter' && applyVoucherCode()}
                                            />
                                            <button onClick={applyVoucherCode}>Áp dụng</button>
                                        </div>

                                        {/* Danh sách khuyến mãi khả dụng */}
                                        {availablePromotions.length > 0 && (
                                            <div className="available-promotions-list">
                                                <p className="promo-label">Khuyến mãi khả dụng:</p>
                                                {availablePromotions.map((promo, index) => (
                                                    <div
                                                        key={index}
                                                        className={`promo-item ${selectedPromotion?.MaKM === promo.MaKM ? 'selected' : ''}`}
                                                        onClick={() => selectPromotion(promo)}
                                                    >
                                                        <div className="promo-info">
                                                            <strong>{promo.TenKM}</strong>
                                                            <small>{promo.MoTa}</small>
                                                        </div>
                                                        <div className="promo-value">
                                                            -{(promo.giaTriGiamDuKien || 0).toLocaleString()}đ
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hiển thị KM đang áp dụng */}
                                {selectedPromotion && promotionDiscount > 0 && (
                                    <div className="applied-promotion">
                                        <div className="promo-applied-info">
                                            <span className="material-icons">check_circle</span>
                                            <span>{selectedPromotion.TenKM}</span>
                                        </div>
                                        <button
                                            className="btn-remove-promo"
                                            onClick={removePromotion}
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {promotionDiscount > 0 && (
                                <div className="total-row discount">
                                    <span>Giảm giá</span>
                                    <span className="total-value discount-value">-{promotionDiscount.toLocaleString()}đ</span>
                                </div>
                            )}

                            <div className="total-row final">
                                <span>THÀNH TIỀN</span>
                                <span className="total-final">{calculateTotal().toLocaleString()}đ</span>
                            </div>
                        </div>

                        <div className="payment-methods-grid">
                            {['cash', 'vnpay', 'momo', 'zalopay'].map(method => (
                                <button
                                    key={method}
                                    className={`pay-btn ${method} ${paymentMethod === method ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    <span className="material-icons">
                                        {method === 'cash' ? 'payments' :
                                            method === 'vnpay' ? 'account_balance' :
                                                method === 'momo' ? 'account_balance_wallet' : 'qr_code_2'}
                                    </span>
                                    <span>{method.toUpperCase()}</span>
                                </button>
                            ))}
                        </div>

                        {paymentMethod === 'cash' && (
                            <div className="cash-input-area">
                                <input
                                    type="number"
                                    value={customerGiven}
                                    onChange={(e) => setCustomerGiven(e.target.value)}
                                    placeholder="Tiền khách đưa..."
                                />
                                {customerGiven && calculateChange() > 0 && (
                                    <div className="change-hint">Thừa: {calculateChange().toLocaleString()}đ</div>
                                )}
                            </div>
                        )}

                        <button className="btn-checkout-final" onClick={handleCheckout} disabled={loading || cart.length === 0}>
                            {loading ? 'ĐANG XỬ LÝ...' : `THANH TOÁN (${calculateTotal().toLocaleString()}đ)`}
                        </button>
                    </div>
                </div>

                {/* Right Side - Product Catalog */}
                <div className="pos-main-products">
                    <div className="product-tools">
                        <div className="category-filter">
                            <button
                                className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >Tất cả</button>
                            {categories.map(cat => (
                                <button
                                    key={cat.MaTL}
                                    className={`cat-btn ${selectedCategory === cat.MaTL.toString() ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.MaTL.toString())}
                                >{cat.TenTL}</button>
                            ))}
                        </div>
                        <div className="product-search-bar">
                            <span className="material-icons">search</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách hoặc quét mã vạch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="btn-scan-barcode"
                                onClick={toggleBarcodeScanner}
                                title="Quét mã vạch sản phẩm"
                            >
                                <span className="material-icons">qr_code_scanner</span>
                                Quét mã
                            </button>
                        </div>
                    </div>

                    <div className="product-catalog-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product.MaSP}
                                className={`product-item-card${product.SoLuong <= 0 ? ' sold-out' : ''}`}
                                onClick={() => addToCart(product)}
                            >
                                <div className="product-item-image">
                                    <img src={getImageUrl(product.HinhAnh || product.Anh)} alt={product.TenSP} />
                                    {product.SoLuong <= 0 && <span className="out-of-stock">Hết hàng</span>}
                                </div>
                                <div className="product-item-info">
                                    <h4 title={product.TenSP}>{product.TenSP}</h4>
                                    <div className="product-item-footer">
                                        <span className="price">{product.DonGia?.toLocaleString()}đ</span>
                                        <span className={`stock ${product.SoLuong <= 0 ? 'stock-empty' : product.SoLuong <= 5 ? 'stock-low' : ''}`}>Quầy: {product.SoLuong}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Barcode Scanner Modal */}
            {showScanner && (
                <div className="barcode-scanner-modal" onClick={closeBarcodeScanner}>
                    <div className="scanner-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="scanner-header">
                            <h3>📷 Quét Mã Vạch Sản Phẩm</h3>
                            <button className="btn-close-scanner" onClick={closeBarcodeScanner}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="scanner-status">
                            <span className="material-icons">info</span>
                            <p>{scannerStatus}</p>
                        </div>

                        <div className="scanner-video-container" ref={scannerRef}>
                            <div id="barcode-reader"></div>
                        </div>

                        <div className="scanner-manual-input">
                            <p className="manual-label">Hoặc nhập ISBN thủ công:</p>
                            <div className="manual-input-group">
                                <input
                                    type="text"
                                    placeholder="Nhập ISBN (VD: 978-604-1-00000-1)"
                                    value={manualISBN}
                                    onChange={(e) => setManualISBN(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleManualISBNSubmit()}
                                />
                                <button onClick={handleManualISBNSubmit}>
                                    <span className="material-icons">search</span>
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>

                        <div className="scanner-instructions">
                            <p><strong>💡 Hướng dẫn:</strong></p>
                            <ol>
                                <li>Cho phép trình duyệt truy cập webcam</li>
                                <li>Hiển thị barcode từ trang <a href="/admin/barcode-generator" target="_blank">Barcode Generator</a></li>
                                <li>Đưa mã vạch vào giữa khung hình màu đỏ</li>
                                <li>Giữ yên, camera sẽ tự động quét</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Receipt Modal */}
            {showInvoiceReceipt && completedInvoice && (
                <div className="invoice-receipt-modal" onClick={() => setShowInvoiceReceipt(false)}>
                    <div className="invoice-receipt-content" onClick={(e) => e.stopPropagation()}>
                        <div className="invoice-receipt-actions">
                            <button className="btn-print" onClick={printReceipt}>
                                <span className="material-icons">print</span>
                                In hóa đơn
                            </button>
                            <button className="btn-close-receipt" onClick={() => setShowInvoiceReceipt(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div id="invoice-receipt-print">
                            <div className="receipt-header">
                                <h2>NHÀ SÁCH FAHASA</h2>
                                <p>Địa chỉ: 123 Nguyễn Huệ, Q.1, TP.HCM</p>
                                <p>Điện thoại: 0123 456 789</p>
                                <h3 style={{ marginTop: '15px' }}>HÓA ĐƠN BÁN HÀNG</h3>
                            </div>

                            <div className="receipt-info">
                                <p><strong>Mã hóa đơn:</strong> #{completedInvoice.MaHD}</p>
                                <p><strong>Ngày:</strong> {completedInvoice.NgayBan}</p>
                                <p><strong>Nhân viên:</strong> {completedInvoice.NhanVien}</p>
                                <p><strong>Khách hàng:</strong> {completedInvoice.KhachHang}</p>
                                {completedInvoice.SDT && <p><strong>SĐT:</strong> {completedInvoice.SDT}</p>}
                                <p><strong>Phương thức:</strong> {completedInvoice.PhuongThucTT}</p>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-right">SL</th>
                                        <th className="text-right">Đơn giá</th>
                                        <th className="text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedInvoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.TenSP}</td>
                                            <td className="text-right">{item.SoLuong}</td>
                                            <td className="text-right">{item.DonGia.toLocaleString()}đ</td>
                                            <td className="text-right">{item.ThanhTien.toLocaleString()}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="total-section">
                                <div className="total-row">
                                    <span>Tổng tiền:</span>
                                    <span>{completedInvoice.TongTien.toLocaleString()}đ</span>
                                </div>
                                {completedInvoice.GiamGia > 0 && (
                                    <div className="total-row">
                                        <span>Giảm giá:</span>
                                        <span>-{completedInvoice.GiamGia.toLocaleString()}đ</span>
                                    </div>
                                )}
                                <div className="total-row final">
                                    <span>THÀNH TIỀN:</span>
                                    <span>{completedInvoice.ThanhToan.toLocaleString()}đ</span>
                                </div>
                                {completedInvoice.PhuongThucTT === 'Tiền mặt' && (
                                    <>
                                        <div className="total-row">
                                            <span>Tiền khách đưa:</span>
                                            <span>{completedInvoice.TienKhachDua.toLocaleString()}đ</span>
                                        </div>
                                        <div className="total-row">
                                            <span>Tiền thừa:</span>
                                            <span>{completedInvoice.TienThua.toLocaleString()}đ</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="receipt-footer">
                                <p>Cảm ơn quý khách và hẹn gặp lại!</p>
                                <p>Hotline: 1900-xxxx</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccessNotification && (
                <div className="success-notification-overlay">
                    <div className="success-notification">
                        <div className="success-icon">
                            <span className="material-icons">check_circle</span>
                        </div>
                        <h2>Thanh toán thành công!</h2>
                        <p>Đang tạo hóa đơn...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSPage;
