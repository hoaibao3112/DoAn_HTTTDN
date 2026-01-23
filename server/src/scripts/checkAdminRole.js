import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

(async function(){
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bansach_offline',
    port: parseInt(process.env.DB_PORT) || 3306,
  };
  const conn = await mysql.createConnection(dbConfig);
  try{
    const [rows] = await conn.query('SELECT MaTK, TenTK, MaNQ, TinhTrang FROM taikhoan WHERE TenTK = ?', ['admin']);
    console.log('admin account rows:', rows);
    if(rows.length>0){
      const maNQ = rows[0].MaNQ;
      const [perms] = await conn.query('SELECT ct.*, cn.TenCN FROM phanquyen_chitiet ct JOIN chucnang cn ON ct.MaCN = cn.MaCN WHERE ct.MaNQ = ? ORDER BY ct.MaCN', [maNQ]);
      console.log(`\nPermissions for MaNQ=${maNQ}:`);
      console.table(perms.map(p=>({MaCN:p.MaCN, TenCN:p.TenCN, Xem:p.Xem, Them:p.Them, Sua:p.Sua, Xoa:p.Xoa, XuatFile:p.XuatFile, Duyet:p.Duyet})));
    }
  }catch(err){
    console.error(err.message);
  }finally{
    await conn.end();
  }
})();
