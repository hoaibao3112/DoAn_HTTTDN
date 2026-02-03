import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode';
import '../styles/BarcodeGeneratorPage.css';

const BarcodeGeneratorPage = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('Vui lòng đăng nhập để xem danh sách sản phẩm');
                setLoading(false);
                return;
            }
            
            const response = await axios.get(
                'http://localhost:5000/api/warehouse/products?pageSize=100',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data) {
                const items = response.data.data.items || response.data.data;
                // Chỉ lấy sản phẩm có ISBN
                const productsWithISBN = items.filter(p => p.ISBN);
                setProducts(productsWithISBN);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/admin/login';
            } else {
                alert('Lỗi tải danh sách sản phẩm: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handlePrintAll = () => {
        window.print();
    };

    const handleDownloadForPhone = (product) => {
        // Tạo canvas để vẽ barcode với background tối
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Kích thước canvas (tỉ lệ màn hình điện thoại)
        canvas.width = 1080;
        canvas.height = 1920;
        
        // Background tối (màu xám đen nhẹ, không quá đen)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Vẽ tiêu đề sản phẩm
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        const maxWidth = canvas.width - 100;
        wrapText(ctx, product.TenSP, canvas.width / 2, 150, maxWidth, 60);
        
        // Vẽ ISBN
        ctx.font = '36px Arial';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`ISBN: ${product.ISBN}`, canvas.width / 2, 300);
        
        // Tạo barcode tạm để lấy image data
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);
        
        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tempContainer.appendChild(tempSvg);
        
        // Import JsBarcode để generate barcode
        import('jsbarcode').then((JsBarcode) => {
            JsBarcode.default(tempSvg, product.ISBN.replace(/-/g, ''), {
                format: 'CODE128',
                width: 4,
                height: 300,
                displayValue: true,
                fontSize: 40,
                margin: 20,
                background: '#ffffff',
                lineColor: '#000000'
            });
            
            // Convert SVG to image
            const svgData = new XMLSerializer().serializeToString(tempSvg);
            const img = new Image();
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = () => {
                // Vẽ barcode vào giữa canvas
                const barcodeX = (canvas.width - img.width) / 2;
                const barcodeY = 400;
                
                // Vẽ background trắng cho barcode
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(barcodeX - 40, barcodeY - 40, img.width + 80, img.height + 80);
                
                // Vẽ barcode
                ctx.drawImage(img, barcodeX, barcodeY);
                
                // Vẽ hướng dẫn
                ctx.fillStyle = '#888888';
                ctx.font = '32px Arial';
                ctx.fillText('📱 Giữ ảnh này trên điện thoại', canvas.width / 2, barcodeY + img.height + 150);
                ctx.fillText('Đưa vào camera POS để quét', canvas.width / 2, barcodeY + img.height + 200);
                
                // Download canvas as image
                canvas.toBlob((blob) => {
                    const downloadUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = `barcode-${product.ISBN.replace(/-/g, '')}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(downloadUrl);
                    URL.revokeObjectURL(url);
                    document.body.removeChild(tempContainer);
                });
            };
            
            img.src = url;
        }).catch(err => {
            console.error('Error loading JsBarcode:', err);
            alert('Lỗi tải thư viện barcode. Vui lòng thử lại.');
            document.body.removeChild(tempContainer);
        });
    };
    
    // Helper function để wrap text
    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, currentY);
    };

    const filteredProducts = products.filter(p =>
        p.TenSP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ISBN?.includes(searchTerm)
    );

    return (
        <div className="barcode-generator-page">
            <div className="page-header">
                <h1>📦 Barcode Generator - Demo Tool</h1>
                <p className="subtitle">
                    Tạo và hiển thị barcode ISBN cho sản phẩm.
                    Dùng để test tính năng quét mã trên POS.
                </p>
            </div>

            <div className="barcode-tools">
                <div className="search-box">
                    <span className="material-icons">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên hoặc ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-print-all" onClick={handlePrintAll}>
                    <span className="material-icons">print</span>
                    In tất cả Barcode
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <span className="material-icons">inventory_2</span>
                    <p>Không có sản phẩm nào có ISBN</p>
                    <small>Vui lòng thêm ISBN cho sản phẩm trong quản lý kho</small>
                </div>
            ) : (
                <div className="barcode-grid">
                    {filteredProducts.map(product => (
                        <div
                            key={product.MaSP}
                            className="barcode-card"
                            onClick={() => handleProductClick(product)}
                        >
                            <div className="product-info">
                                <h3 className="product-name">{product.TenSP}</h3>
                                <p className="product-isbn">ISBN: {product.ISBN}</p>
                            </div>
                            <div className="barcode-container">
                                {product.ISBN && (
                                    <Barcode
                                        value={product.ISBN.replace(/-/g, '')}
                                        format="CODE128"
                                        width={2}
                                        height={60}
                                        displayValue={true}
                                        fontSize={12}
                                        margin={5}
                                    />
                                )}
                            </div>
                            <button className="btn-view-large">
                                <span className="material-icons">zoom_in</span>
                                Xem lớn
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal hiển thị barcode full-screen */}
            {showModal && selectedProduct && (
                <div className="barcode-modal" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-close-modal" onClick={handleCloseModal}>
                            <span className="material-icons">close</span>
                        </button>
                        <div className="modal-body">
                            <h2>{selectedProduct.TenSP}</h2>
                            <p className="modal-isbn">ISBN: {selectedProduct.ISBN}</p>
                            <div className="barcode-large">
                                {selectedProduct.ISBN && (
                                    <Barcode
                                        value={selectedProduct.ISBN.replace(/-/g, '')}
                                        format="CODE128"
                                        width={3}
                                        height={150}
                                        displayValue={true}
                                        fontSize={20}
                                        margin={20}
                                    />
                                )}
                            </div>
                            <div className="modal-instructions">
                                <p><strong>💡 Hướng dẫn sử dụng:</strong></p>
                                <ol>
                                    <li>Hiển thị barcode này trên điện thoại hoặc màn hình thứ 2</li>
                                    <li>Vào trang POS, click nút "Quét mã vạch"</li>
                                    <li>Cho phép truy cập webcam</li>
                                    <li>Đưa barcode vào trước camera để quét</li>
                                    <li>Sản phẩm sẽ tự động thêm vào giỏ hàng!</li>
                                </ol>
                                <div className="modal-actions">
                                    <button 
                                        className="btn-download-phone"
                                        onClick={() => handleDownloadForPhone(selectedProduct)}
                                    >
                                        <span className="material-icons">phone_android</span>
                                        Tải về cho điện thoại
                                    </button>
                                    <p className="hint">
                                        <span className="material-icons">info</span>
                                        Background tối giúp quét dễ hơn!
                                    </p>
                                </div>
                                <p className="hint">
                                    <span className="material-icons">print</span>
                                    Hoặc bấm Ctrl+P để in barcode này ra giấy
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print-only content */}
            <div className="print-only">
                <h1>Barcode Catalog - Bookstore POS</h1>
                <div className="print-barcode-grid">
                    {filteredProducts.map(product => (
                        <div key={product.MaSP} className="print-barcode-item">
                            <h4>{product.TenSP}</h4>
                            <p>ISBN: {product.ISBN}</p>
                            {product.ISBN && (
                                <Barcode
                                    value={product.ISBN.replace(/-/g, '')}
                                    format="CODE128"
                                    width={2}
                                    height={80}
                                    displayValue={true}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BarcodeGeneratorPage;
