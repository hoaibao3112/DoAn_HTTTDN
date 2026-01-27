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

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const cashierName = userInfo.HoTen || 'Nguyễn Văn A';

    useEffect(() => {
        fetchProducts();
        checkOpenSession();
    }, []);

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
            const response = await axios.get('http://localhost:5000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.data) {
                setProducts(response.data.data.items || response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
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
        if (!customer || !customer.DiemTichLuy) return 0;
        // Use points as discount (example: 100 points = 50,000 VND)
        return Math.min(customer.DiemTichLuy * 500, calculateSubtotal() * 0.1);
    };

    const calculateTax = () => {
        return (calculateSubtotal() - calculateDiscount()) * 0.08; // 8% VAT
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
                PhuongThucTT: paymentMethod === 'cash' ? 'Tien_mat' : paymentMethod === 'card' ? 'The' : 'Chuyen_khoan',
                TienKhachDua: parseFloat(customerGiven) || calculateTotal(),
                DiemSuDung: customer ? Math.floor(calculateDiscount() / 500) : 0
            };

            const response = await axios.post(
                'http://localhost:5000/api/sales/invoices',
                invoiceData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert(`Thanh toán thành công! Mã hóa đơn: ${response.data.MaHD || 'N/A'}`);

                // Reset
                setCart([]);
                setCustomer(null);
                setCustomerSearch('');
                setCustomerGiven('');
                setPaymentMethod('cash');

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

    const filteredProducts = products.filter(p =>
        p.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.MaSP?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                {/* Left Side - Products */}
                <div className="pos-left">
                    <div className="product-search">
                        <span className="material-icons">qr_code_scanner</span>
                        <input
                            type="text"
                            placeholder="Quét mã vạch hoặc tìm theo tiêu đề sách (F1)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        <span className="search-shortcut">F1</span>
                    </div>

                    <div className="cart-section">
                        <div className="cart-header">
                            <h3>SẢN PHẨM</h3>
                            <div className="cart-stats">
                                <span>SỐ LƯỢNG</span>
                                <span>ĐƠN GIÁ</span>
                                <span>THÀNH TIỀN</span>
                            </div>
                        </div>

                        <div className="cart-items">
                            {cart.length > 0 ? (
                                cart.map(item => (
                                    <div key={item.MaSP} className="cart-item">
                                        <div className="item-image">
                                            <img src={item.Anh || '/placeholder-book.jpg'} alt={item.TenSP} />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.TenSP}</h4>
                                            <p className="item-code">{item.MaSP}</p>
                                        </div>
                                        <div className="item-quantity">
                                            <button onClick={() => updateQuantity(item.MaSP, item.quantity - 1)}>−</button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.MaSP, e.target.value)}
                                                min="1"
                                            />
                                            <button onClick={() => updateQuantity(item.MaSP, item.quantity + 1)}>+</button>
                                        </div>
                                        <div className="item-price">
                                            {item.DonGia?.toLocaleString()}đ
                                        </div>
                                        <div className="item-total">
                                            {(item.DonGia * item.quantity).toLocaleString()}đ
                                        </div>
                                        <button className="item-remove" onClick={() => removeFromCart(item.MaSP)}>
                                            <span className="material-icons">delete_outline</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="cart-empty">
                                    <p>Giỏ chưa dừng hàng...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Product List */}
                    <div className="product-grid">
                        {filteredProducts.slice(0, 6).map(product => (
                            <div
                                key={product.MaSP}
                                className="product-card"
                                onClick={() => addToCart(product)}
                            >
                                <div className="product-image">
                                    <img src={product.Anh || '/placeholder-book.jpg'} alt={product.TenSP} />
                                </div>
                                <h4>{product.TenSP}</h4>
                                <p className="product-price">{product.DonGia?.toLocaleString()}đ</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Customer & Payment */}
                <div className="pos-right">
                    {/* Customer Section */}
                    <div className="customer-section">
                        <h3>KHÁCH HÀNG</h3>
                        <button className="btn-add-customer" onClick={() => setShowCustomerForm(!showCustomerForm)}>
                            <span className="material-icons">person_add</span>
                            Thêm mới
                        </button>

                        <div className="customer-search-box">
                            <span className="material-icons">search</span>
                            <input
                                type="text"
                                placeholder="Số điện thoại hoặc mã KH..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                            />
                        </div>

                        {customer && (
                            <div className="customer-info-card">
                                <div className="customer-avatar">
                                    <span className="material-icons">account_circle</span>
                                </div>
                                <div className="customer-details">
                                    <h4>{customer.HoTen || customer.TenKH}</h4>
                                    <p>{customer.SDT}</p>
                                    <p className="customer-points">Điểm tích lũy: {customer.DiemTichLuy || 0} điểm</p>
                                </div>
                                <button className="btn-remove-customer" onClick={() => setCustomer(null)}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                        )}

                        {showCustomerForm && (
                            <div className="quick-customer-form">
                                <input
                                    type="text"
                                    placeholder="Tên khách hàng"
                                    value={newCustomer.TenKH}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, TenKH: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Số điện thoại"
                                    value={newCustomer.SDT}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, SDT: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newCustomer.Email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, Email: e.target.value })}
                                />
                                <button className="btn-save-customer" onClick={createCustomer}>
                                    Lưu khách hàng
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Totals Section */}
                    <div className="totals-section">
                        <h3>TỔNG CỘNG</h3>

                        <div className="total-row">
                            <span>Tổng tiền hàng</span>
                            <span className="total-value">{calculateSubtotal().toLocaleString()}.000đ</span>
                        </div>

                        {customer && calculateDiscount() > 0 && (
                            <div className="total-row discount">
                                <span>Giảm giá</span>
                                <span className="total-value">-{calculateDiscount().toLocaleString()}.000đ</span>
                            </div>
                        )}

                        <div className="total-row">
                            <span>Thuế (8%)</span>
                            <span className="total-value">{calculateTax().toLocaleString()}.000đ</span>
                        </div>

                        <div className="total-row final">
                            <span>THÀNH TIỀN</span>
                            <span className="total-final">{calculateTotal().toLocaleString()}.000đ</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="payment-methods">
                        <button
                            className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <span className="material-icons">payments</span>
                            <span>TIỀN MẶT</span>
                        </button>
                        <button
                            className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <span className="material-icons">credit_card</span>
                            <span>THẺ</span>
                        </button>
                        <button
                            className={`payment-btn ${paymentMethod === 'transfer' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('transfer')}
                        >
                            <span className="material-icons">qr_code</span>
                            <span>CHUYỂN KHOẢN</span>
                        </button>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="cash-input">
                            <label>Tiền khách đưa</label>
                            <input
                                type="number"
                                value={customerGiven}
                                onChange={(e) => setCustomerGiven(e.target.value)}
                                placeholder="0"
                            />
                            {customerGiven && calculateChange() > 0 && (
                                <div className="change-display">
                                    Tiền thừa: <strong>{calculateChange().toLocaleString()}.000đ</strong>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pos-actions">
                        <button className="btn-action btn-print">
                            <span className="material-icons">print</span>
                            In lại hóa đơn
                        </button>
                        <button className="btn-action btn-pause">
                            <span className="material-icons">pause</span>
                            Tạm dừng (F4)
                        </button>
                        <button className="btn-action btn-cancel" onClick={() => setCart([])}>
                            <span className="material-icons">cancel</span>
                            Hủy đơn
                        </button>
                    </div>

                    {/* Checkout Button */}
                    <button
                        className="btn-checkout"
                        onClick={handleCheckout}
                        disabled={loading || cart.length === 0}
                    >
                        <span className="material-icons">check_circle</span>
                        {loading ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN (F12)'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
