import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import axios from 'axios';
import '../styles/AttendancePage.css';

const API_HR = 'http://localhost:5000/api/hr';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n || 0)) + 'đ';
const fmtShort = (n) => {
  const v = Math.round(n || 0);
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '') + ' tr';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'k';
  return v + 'đ';
};

const SalaryPage = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryList, setSalaryList] = useState([]);
  const [summary, setSummary] = useState({ TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [paying, setPaying] = useState(null); // MaNV đang xử lý
  const [payingAll, setPayingAll] = useState(false);

  // Modal chi tiết
  const [detailModal, setDetailModal] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const token = localStorage.getItem('authToken');
  const headers = { Authorization: `Bearer ${token}` };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
  const years = Array.from({ length: 8 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));

  const fetchSalary = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_HR}/salary-detail?year=${year}&month=${month}`,
        { headers }
      );
      if (res.data.success) {
        setSalaryList(res.data.data || []);
        setSummary(res.data.summary || { TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Fetch salary error:', err);
      }
      setSalaryList([]);
      setSummary({ TongLuong: 0, DaChiTra: 0, ChuaChiTra: 0, SoNVDaTra: 0 });
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSalary(); }, [month, year]);

  const handleCalculate = async () => {
    if (!window.confirm(`Tính lương tháng ${month}/${year} cho toàn bộ nhân viên?\nNếu đã tính trước đó, dữ liệu sẽ được cập nhật lại.`)) return;
    setCalculating(true);
    try {
      const res = await axios.post(`${API_HR}/salary/calculate`, { month, year }, { headers });
      if (res.data.success) {
        alert(res.data.message);
        fetchSalary();
      }
    } catch (err) {
      alert('Lỗi tính lương: ' + (err.response?.data?.message || err.message));
    }
    setCalculating(false);
  };

  const handlePayOne = async (row) => {
    if (row.TrangThai === 'Da_chi_tra') return;
    if (!window.confirm(`Xác nhận đã chi trả lương cho ${row.HoTen}?\nSố tiền: ${fmt(row.TongLuong)}`)) return;
    setPaying(row.MaNV);
    try {
      await axios.put(`${API_HR}/salary-pay`, { MaNV: row.MaNV, month, year }, { headers });
      fetchSalary();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setPaying(null);
  };

  const handlePayAll = async () => {
    const pending = salaryList.filter(r => r.TrangThai !== 'Da_chi_tra');
    if (pending.length === 0) { alert('Tất cả đã được chi trả!'); return; }
    if (!window.confirm(`Xác nhận chi trả lương cho ${pending.length} nhân viên còn lại?\nTổng: ${fmt(summary.ChuaChiTra)}`)) return;
    setPayingAll(true);
    try {
      const res = await axios.put(`${API_HR}/salary-pay-all`, { month, year }, { headers });
      alert(res.data.message);
      fetchSalary();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
    setPayingAll(false);
  };

  const dailyRate = (row) => parseFloat(row.LuongCoBan || 0) / 26;
  const hourlyRate = (row) => parseFloat(row.LuongCoBan || 0) / 208;
  const basePay = (row) => dailyRate(row) * parseFloat(row.SoNgayLam || 0);
  const otPay = (row) => parseFloat(row.SoGioTangCa || 0) * hourlyRate(row) * 1.5;

  const pendingCount = salaryList.filter(r => r.TrangThai !== 'Da_chi_tra').length;
  const paidCount = salaryList.filter(r => r.TrangThai === 'Da_chi_tra').length;

  return (
    <div className="thongke-page">
      {/* ===== HEADER ===== */}
      <div className="thongke-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1><i className="fas fa-money-bill-wave"></i> Tính lương nhân viên</h1>
      </div>

      {/* ===== BỘ LỌC ===== */}
      <div className="thongke-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Tháng:</label>
            <Select
              options={months}
              value={months.find(m => m.value === month)}
              onChange={v => setMonth(v.value)}
              styles={{ control: b => ({ ...b, minWidth: 130 }), menu: b => ({ ...b, zIndex: 9999 }) }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Năm:</label>
            <Select
              options={years}
              value={years.find(y => y.value === year)}
              onChange={v => setYear(v.value)}
              styles={{ control: b => ({ ...b, minWidth: 110 }), menu: b => ({ ...b, zIndex: 9999 }) }}
            />
          </div>

          {/* Nút tính lương */}
          <button
            onClick={handleCalculate}
            disabled={calculating}
            style={{
              background: calculating ? '#90caf9' : '#1976d2',
              color: '#fff', border: 'none', borderRadius: 6,
              padding: '9px 20px', fontWeight: 700, fontSize: 14,
              cursor: calculating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 2px 6px rgba(25,118,210,0.3)'
            }}
          >
            <i className={`fas ${calculating ? 'fa-spinner fa-spin' : 'fa-calculator'}`}></i>
            {calculating ? 'Đang tính...' : `Tính lương T${month}/${year}`}
          </button>

          {/* Nút chi trả tất cả */}
          {salaryList.length > 0 && pendingCount > 0 && (
            <button
              onClick={handlePayAll}
              disabled={payingAll}
              style={{
                background: payingAll ? '#a5d6a7' : '#388e3c',
                color: '#fff', border: 'none', borderRadius: 6,
                padding: '9px 20px', fontWeight: 700, fontSize: 14,
                cursor: payingAll ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <i className={`fas ${payingAll ? 'fa-spinner fa-spin' : 'fa-check-double'}`}></i>
              {payingAll ? 'Đang xử lý...' : `Chi trả tất cả (${pendingCount} NV)`}
            </button>
          )}
        </div>

        {/* ===== SUMMARY CARDS ===== */}
        {salaryList.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <SummaryCard
              icon="fa-users"
              label="Tổng nhân viên"
              value={`${total} người`}
              color="#1976d2"
              bg="#e3f2fd"
            />
            <SummaryCard
              icon="fa-money-bill-wave"
              label="Tổng chi lương"
              value={fmtShort(summary.TongLuong)}
              sub={fmt(summary.TongLuong)}
              color="#6a1b9a"
              bg="#f3e5f5"
            />
            <SummaryCard
              icon="fa-check-circle"
              label="Đã chi trả"
              value={`${paidCount}/${total} NV`}
              sub={fmt(summary.DaChiTra)}
              color="#2e7d32"
              bg="#e8f5e9"
            />
            <SummaryCard
              icon="fa-clock"
              label="Chưa chi trả"
              value={`${pendingCount}/${total} NV`}
              sub={fmt(summary.ChuaChiTra)}
              color="#e65100"
              bg="#fff3e0"
            />
          </div>
        )}

        {/* ===== TRẠNG THÁI CHƯA TÍNH LƯƠNG ===== */}
        {!loading && salaryList.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#f5f5f5', borderRadius: 12, color: '#777'
          }}>
            <i className="fas fa-file-invoice-dollar" style={{ fontSize: 48, marginBottom: 16, color: '#bdbdbd' }}></i>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Chưa có dữ liệu lương tháng {month}/{year}
            </div>
            <div style={{ fontSize: 14 }}>
              Nhấn <strong>"Tính lương T{month}/{year}"</strong> để bắt đầu tính lương cho tháng này.
            </div>
            <div style={{ fontSize: 13, color: '#9e9e9e', marginTop: 8 }}>
              Hệ thống sẽ tự động tính dựa trên dữ liệu chấm công đã có.
            </div>
          </div>
        )}

        {/* ===== BẢNG LƯƠNG ===== */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#1976d2' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
            <div style={{ marginTop: 8 }}>Đang tải dữ liệu lương...</div>
          </div>
        )}

        {!loading && salaryList.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="salary-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#1976d2', color: '#fff' }}>
                  <th style={th}>STT</th>
                  <th style={{ ...th, textAlign: 'left', minWidth: 160 }}>Họ tên</th>
                  <th style={th}>Chức vụ</th>
                  <th style={th}>Lương CB</th>
                  <th style={th}>Ngày công</th>
                  <th style={th}>Lương công</th>
                  <th style={th}>TCA (h)</th>
                  <th style={th}>Lương TCA</th>
                  <th style={th}>Phụ cấp</th>
                  <th style={th}>Thưởng</th>
                  <th style={th}>Phạt</th>
                  <th style={{ ...th, background: '#0d47a1', fontSize: 15 }}>Tổng lương</th>
                  <th style={th}>Trạng thái</th>
                  <th style={th}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {salaryList.map((row, idx) => {
                  const isPaid = row.TrangThai === 'Da_chi_tra';
                  const bp = basePay(row);
                  const op = otPay(row);
                  return (
                    <tr
                      key={row.MaNV}
                      style={{
                        background: isPaid ? '#f1f8e9' : (idx % 2 === 0 ? '#fff' : '#fafafa'),
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e3f2fd'}
                      onMouseLeave={e => e.currentTarget.style.background = isPaid ? '#f1f8e9' : (idx % 2 === 0 ? '#fff' : '#fafafa')}
                    >
                      <td style={td}>{idx + 1}</td>
                      <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>
                        <div>{row.HoTen}</div>
                        <div style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>{row.MaNV}</div>
                      </td>
                      <td style={{ ...td, fontSize: 12, color: '#555' }}>{row.ChucVu || '—'}</td>
                      <td style={tdRight}>{fmt(row.LuongCoBan)}</td>
                      <td style={{ ...td, fontWeight: 700, color: '#1976d2' }}>{row.SoNgayLam}</td>
                      <td style={tdRight}>{fmt(bp)}</td>
                      <td style={{ ...td, color: row.SoGioTangCa > 0 ? '#e65100' : '#999' }}>
                        {row.SoGioTangCa > 0 ? `+${row.SoGioTangCa}h` : '—'}
                      </td>
                      <td style={{ ...tdRight, color: op > 0 ? '#e65100' : '#999' }}>
                        {op > 0 ? fmt(op) : '—'}
                      </td>
                      <td style={tdRight}>{fmt(row.PhuCap)}</td>
                      <td style={{ ...tdRight, color: row.Thuong > 0 ? '#2e7d32' : '#999' }}>
                        {row.Thuong > 0 ? fmt(row.Thuong) : '—'}
                      </td>
                      <td style={{ ...tdRight, color: row.Phat > 0 ? '#c62828' : '#999' }}>
                        {row.Phat > 0 ? `-${fmt(row.Phat)}` : '—'}
                      </td>
                      <td style={{
                        ...tdRight, fontWeight: 700, fontSize: 15,
                        color: '#1976d2', background: '#e3f2fd'
                      }}>
                        {fmt(row.TongLuong)}
                      </td>
                      <td style={td}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: isPaid ? '#e8f5e9' : '#fff3e0',
                          color: isPaid ? '#2e7d32' : '#e65100',
                          border: `1px solid ${isPaid ? '#a5d6a7' : '#ffcc80'}`
                        }}>
                          <i className={`fas ${isPaid ? 'fa-check-circle' : 'fa-clock'}`}></i>
                          {isPaid ? 'Đã chi trả' : 'Chưa trả'}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => { setDetailRow(row); setDetailModal(true); }}
                            title="Xem chi tiết"
                            style={{
                              background: '#1976d2', color: '#fff', border: 'none',
                              borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 12
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {!isPaid && (
                            <button
                              onClick={() => handlePayOne(row)}
                              disabled={paying === row.MaNV}
                              title="Đánh dấu đã chi trả"
                              style={{
                                background: paying === row.MaNV ? '#a5d6a7' : '#388e3c',
                                color: '#fff', border: 'none', borderRadius: 4,
                                padding: '5px 10px', cursor: 'pointer', fontSize: 12
                              }}
                            >
                              <i className={`fas ${paying === row.MaNV ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Footer tổng */}
              <tfoot>
                <tr style={{ background: '#263238', color: '#fff', fontWeight: 700 }}>
                  <td colSpan={3} style={{ ...td, textAlign: 'left', paddingLeft: 12 }}>
                    TỔNG CỘNG ({total} nhân viên)
                  </td>
                  <td style={tdRight}></td>
                  <td style={td}></td>
                  <td style={tdRight}></td>
                  <td style={td}></td>
                  <td style={tdRight}></td>
                  <td style={tdRight}>{fmt(salaryList.reduce((s, r) => s + parseFloat(r.PhuCap || 0), 0))}</td>
                  <td style={tdRight}>{fmt(salaryList.reduce((s, r) => s + parseFloat(r.Thuong || 0), 0))}</td>
                  <td style={tdRight}>{fmt(salaryList.reduce((s, r) => s + parseFloat(r.Phat || 0), 0))}</td>
                  <td style={{ ...tdRight, fontSize: 16, background: '#0d47a1' }}>
                    {fmt(summary.TongLuong)}
                  </td>
                  <td style={td}>{paidCount}/{total} đã trả</td>
                  <td style={td}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* ===== CHÚ THÍCH CÔNG THỨC ===== */}
        {salaryList.length > 0 && (
          <div style={{
            marginTop: 20, padding: 16, background: '#f8f9fa',
            borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#1976d2' }}>
              <i className="fas fa-info-circle"></i> Công thức tính lương
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
              <div><span style={{ color: '#1976d2' }}>●</span> <b>Lương công:</b> (Lương CB / 26) × Số ngày công</div>
              <div><span style={{ color: '#e65100' }}>●</span> <b>Lương tăng ca:</b> (Lương CB / 208) × Số giờ TCA × 1.5</div>
              <div><span style={{ color: '#2e7d32' }}>●</span> <b>Thưởng chuyên cần:</b> 200.000đ (đủ 26 công, 0 lần trễ)</div>
              <div><span style={{ color: '#c62828' }}>●</span> <b>Phạt:</b> 20.000đ × số lần trễ/về sớm</div>
              <div><span style={{ color: '#6a1b9a' }}>●</span> <b>Ngày lễ nghỉ:</b> Tính 1 ngày lương bình thường</div>
              <div><span style={{ color: '#e65100' }}>●</span> <b>Ngày lễ đi làm:</b> Nhân hệ số lương ngày lễ</div>
            </div>
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#e3f2fd', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}>
              Tổng = Lương công + Lương TCA + Phụ cấp + Thưởng − Phạt
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL CHI TIẾT ===== */}
      {detailModal && detailRow && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
          }}
          onClick={() => setDetailModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 12, width: '90%', maxWidth: 560,
              overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ background: '#1976d2', color: '#fff', padding: '18px 24px' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                <i className="fas fa-file-invoice-dollar"></i> Chi tiết lương
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                {detailRow.HoTen} — Tháng {month}/{year}
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: 24 }}>
              {/* Info row */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <InfoChip label="Mã NV" value={detailRow.MaNV} />
                <InfoChip label="Chức vụ" value={detailRow.ChucVu || '—'} />
                <InfoChip
                  label="Trạng thái"
                  value={detailRow.TrangThai === 'Da_chi_tra' ? '✓ Đã chi trả' : '○ Chưa chi trả'}
                  color={detailRow.TrangThai === 'Da_chi_tra' ? '#2e7d32' : '#e65100'}
                />
              </div>

              {/* Breakdown bảng */}
              <table className="salary-detail-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <tbody>
                  <DetailRow
                    label="Lương cơ bản (1 tháng)"
                    value={fmt(detailRow.LuongCoBan)}
                    note="Mức lương theo hợp đồng"
                  />
                  <DetailRow
                    label={`Số ngày công (${detailRow.SoNgayLam} ngày)`}
                    value={fmt(basePay(detailRow))}
                    note={`= ${fmt(dailyRate(detailRow))}/ngày × ${detailRow.SoNgayLam} ngày`}
                    color="#1976d2"
                    plus
                  />
                  {parseFloat(detailRow.SoGioTangCa || 0) > 0 && (
                    <DetailRow
                      label={`Tăng ca (${detailRow.SoGioTangCa} giờ × 1.5)`}
                      value={fmt(otPay(detailRow))}
                      note={`= ${fmt(hourlyRate(detailRow))}/giờ × ${detailRow.SoGioTangCa}h × 1.5`}
                      color="#e65100"
                      plus
                    />
                  )}
                  <DetailRow
                    label="Phụ cấp"
                    value={fmt(detailRow.PhuCap)}
                    note="Phụ cấp cố định"
                    plus
                  />
                  {parseFloat(detailRow.Thuong || 0) > 0 && (
                    <DetailRow
                      label="Thưởng chuyên cần"
                      value={fmt(detailRow.Thuong)}
                      note="Đủ 26 công, không trễ, không vắng"
                      color="#2e7d32"
                      plus
                    />
                  )}
                  {parseFloat(detailRow.Phat || 0) > 0 && (
                    <DetailRow
                      label="Khấu trừ (đi trễ/về sớm)"
                      value={`−${fmt(detailRow.Phat)}`}
                      note="20.000đ/lần vi phạm"
                      color="#c62828"
                    />
                  )}
                  <tr style={{ background: '#e3f2fd' }}>
                    <td colSpan={2} style={{ padding: '14px 12px', fontWeight: 700, fontSize: 16, color: '#0d47a1', borderTop: '2px solid #1976d2' }}>
                      <i className="fas fa-equals"></i> Tổng lương thực nhận
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 800, fontSize: 18, color: '#0d47a1', borderTop: '2px solid #1976d2' }}>
                      {fmt(detailRow.TongLuong)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Ngày tính */}
              {detailRow.NgayTinh && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#9e9e9e', textAlign: 'right' }}>
                  Ngày tính: {new Date(detailRow.NgayTinh).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {detailRow.TrangThai !== 'Da_chi_tra' && (
                <button
                  onClick={() => { handlePayOne(detailRow); setDetailModal(false); }}
                  style={{
                    background: '#388e3c', color: '#fff', border: 'none',
                    borderRadius: 6, padding: '10px 20px', cursor: 'pointer',
                    fontWeight: 700, fontSize: 14
                  }}
                >
                  <i className="fas fa-check"></i> Đánh dấu đã chi trả
                </button>
              )}
              <button
                onClick={() => setDetailModal(false)}
                style={{
                  background: '#fff', border: '1px solid #ccc', borderRadius: 6,
                  padding: '10px 20px', cursor: 'pointer', fontWeight: 600
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== SUB-COMPONENTS =====

const SummaryCard = ({ icon, label, value, sub, color, bg }) => (
  <div style={{
    background: bg, borderRadius: 10, padding: '16px 20px',
    border: `1px solid ${color}22`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16
      }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>{label}</div>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{sub}</div>}
  </div>
);

const InfoChip = ({ label, value, color }) => (
  <div style={{ fontSize: 12 }}>
    <div style={{ color: '#888', marginBottom: 2 }}>{label}</div>
    <div style={{ fontWeight: 700, color: color || '#333' }}>{value}</div>
  </div>
);

const DetailRow = ({ label, value, note, color, plus }) => (
  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
    <td style={{ padding: '10px 12px', width: 24, color: color || '#555', fontSize: 16 }}>
      {plus !== undefined ? (plus ? '+' : '') : ''}
    </td>
    <td style={{ padding: '10px 4px' }}>
      <div style={{ fontWeight: 600, color: color || '#333' }}>{label}</div>
      {note && <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 2 }}>{note}</div>}
    </td>
    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: color || '#333', whiteSpace: 'nowrap' }}>
      {value}
    </td>
  </tr>
);

// Shared styles
const th = {
  padding: '12px 10px',
  textAlign: 'center',
  fontSize: 13,
  whiteSpace: 'nowrap',
  background: '#1976d2',
  color: '#fff',
  fontWeight: 700,
  border: 'none',
  borderBottom: '2px solid #0d47a1',
};
const td = {
  padding: '10px',
  textAlign: 'center',
  borderBottom: '1px solid #e0e0e0',
  fontSize: 13,
  maxWidth: 'none',
  cursor: 'default',
  border: 'none',
  borderBottom: '1px solid #e0e0e0',
};
const tdRight = {
  padding: '10px',
  textAlign: 'right',
  fontSize: 13,
  maxWidth: 'none',
  cursor: 'default',
  border: 'none',
  borderBottom: '1px solid #e0e0e0',
};

export default SalaryPage;
