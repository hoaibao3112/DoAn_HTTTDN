import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
    const [showPromotions, setShowPromotions] = useState(false);
    const [promotionDiscount, setPromotionDiscount] = useState(0);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const cashierName = userInfo.HoTen || 'Nguyễn Văn A';
    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        checkOpenSession();
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
        // Check if there's an open session
        const savedSession = localStorage.getItem('posSession');
        if (savedSession) {
            setSession(JSON.parse(savedSession));
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/warehouse/products?pageSize=100', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.data) {
                setProducts(response.data.data.items || response.data.data);
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
                    MaCH: 1, // Mặc định chi nhánh 1
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
                    MaCH: 1,
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
                // Take first match
                const foundCustomer = response.data.data[0];
                setCustomer({
                    ...foundCustomer,
                    HoTen: foundCustomer.tenkh,
                    MaKH: foundCustomer.makh,
                    SDT: foundCustomer.sdt,
                    DiemTichLuy: foundCustomer.loyalty_points || 0
                });
                alert(`Khách hàng: ${foundCustomer.tenkh}`);
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
        try {
            const token = localStorage.getItem('authToken');
            // Use /api/customers endpoint
            const payload = {
                tenkh: newCustomer.TenKH,
                sdt: newCustomer.SDT,
                email: newCustomer.Email,
                diachi: newCustomer.DiaChi
            };

            const response = await axios.post(
                'http://localhost:5000/api/customers',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setCustomer({
                    HoTen: newCustomer.TenKH,
                    MaKH: response.data.makh || response.data.MaKH,
                    SDT: newCustomer.SDT,
                    DiemTichLuy: 0
                });
                setShowCustomerForm(false);
                setNewCustomer({ TenKH: '', SDT: '', Email: '', DiaChi: '' });
                alert('Tạo khách hàng thành công!');
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            alert('Lỗi tạo khách hàng: ' + (error.response?.data?.message || error.message));
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.MaSP === product.MaSP);

        if (existing) {
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

        setCart(cart.map(item =>
            item.MaSP === productId
                ? { ...item, quantity: parseInt(newQuantity) || 1 }
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
                items: cart.map(item => ({
                    MaSP: item.MaSP,
                    SoLuong: item.quantity,
                    DonGia: item.DonGia,
                    GiamGia: 0
                })),
                PhuongThucTT: paymentMethod === 'cash' ? 'Tien_mat' :
                    paymentMethod === 'vnpay' ? 'VNPay' :
                        paymentMethod === 'momo' ? 'MoMo' :
                            paymentMethod === 'zalopay' ? 'ZaloPay' : 'The',
                TienKhachDua: parseFloat(customerGiven) || calculateTotal(),
                DiemSuDung: 0
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

                alert(`Thanh toán thành công! Mã hóa đơn: ${MaHD || 'N/A'}`);

                // Reset
                setCart([]);
                setCustomer(null);
                setCustomerSearch('');
                setCustomerGiven('');
                setPaymentMethod('cash');
                setSelectedPromotion(null);
                setPromotionDiscount(0);
                setVoucherCode('');
                setAvailablePromotions([]);

                // Print receipt (optional)
                printReceipt(response.data);
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Lỗi thanh toán: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const printReceipt = (invoiceData) => {
        console.log('Print receipt:', invoiceData);
        alert('In hóa đơn - Chức năng đang phát triển');
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

                <nav className="pos-nav">
                    <button className="nav-btn active">Bán hàng</button>
                    <button className="nav-btn">Kho hàng</button>
                    <button className="nav-btn">Báo cáo</button>
                    <button className="nav-btn">Thiết lập</button>
                </nav>

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
                                    placeholder="SĐT khách hàng..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                                />
                                <button className="btn-add-mini" onClick={() => setShowCustomerForm(!showCustomerForm)}>
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
                                    <input type="text" placeholder="Tên" value={newCustomer.TenKH} onChange={(e) => setNewCustomer({ ...newCustomer, TenKH: e.target.value })} />
                                    <input type="text" placeholder="SĐT" value={newCustomer.SDT} onChange={(e) => setNewCustomer({ ...newCustomer, SDT: e.target.value })} />
                                    <button onClick={createCustomer}>Lưu</button>
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
                        </div>
                    </div>

                    <div className="product-catalog-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product.MaSP}
                                className="product-item-card"
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
                                        <span className="stock">Kho: {product.SoLuong}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
