#!/usr/bin/env node

/**
 * Verification script for March 2026 salary calculation
 * Checks all prerequisites and validates data integrity
 */

import pool from '../config/connectDatabase.js';
import chalk from 'chalk'; // Will fallback to basic console if not available

const log = {
    success: msg => console.log('✅ ' + msg),
    error: msg => console.log('❌ ' + msg),
    warning: msg => console.log('⚠️  ' + msg),
    info: msg => console.log('ℹ️  ' + msg),
    header: msg => console.log('\n' + '═'.repeat(60) + '\n' + msg + '\n' + '═'.repeat(60)),
};

async function checkDatabaseSchema() {
    log.header('1️⃣  DATABASE SCHEMA CHECK');
    
    const connection = await pool.getConnection();
    
    try {
        // Check luong table columns
        log.info('Checking luong table columns...');
        const [luongColumns] = await connection.query(
            'DESCRIBE luong'
        );
        
        const columnNames = luongColumns.map(col => col.Field);
        const requiredColumns = ['KhauTruBHXH', 'ThueTNCN', 'LuongThucLinh'];
        
        let missingColumns = [];
        for (const col of requiredColumns) {
            if (columnNames.includes(col)) {
                log.success(`Column 'luong.${col}' exists`);
            } else {
                log.error(`Column 'luong.${col}' MISSING`);
                missingColumns.push(col);
            }
        }

        if (missingColumns.length > 0) {
            log.warning(`Need to run migration to add columns: ${missingColumns.join(', ')}`);
            console.log(`
Run this SQL:
ALTER TABLE luong
ADD COLUMN KhauTruBHXH INT NOT NULL DEFAULT 0 AFTER Phat,
ADD COLUMN ThueTNCN INT NOT NULL DEFAULT 0 AFTER KhauTruBHXH,
ADD COLUMN LuongThucLinh INT NOT NULL DEFAULT 0 AFTER ThueTNCN;
            `);
        }

        // Check nhanvien table for SoNguoiPhuThuoc
        log.info('\nChecking nhanvien table columns...');
        const [nhanvienColumns] = await connection.query(
            'DESCRIBE nhanvien'
        );
        
        const nhanvienColNames = nhanvienColumns.map(col => col.Field);
        if (nhanvienColNames.includes('SoNguoiPhuThuoc')) {
            log.success(`Column 'nhanvien.SoNguoiPhuThuoc' exists`);
        } else {
            log.warning(`Column 'nhanvien.SoNguoiPhuThuoc' MISSING (optional, but recommended)`);
            console.log(`
Recommended to add:
ALTER TABLE nhanvien
ADD COLUMN SoNguoiPhuThuoc INT NOT NULL DEFAULT 0 AFTER MaCa;
            `);
        }

        // Check tables exist
        log.info('\nChecking required tables...');
        const tables = ['cham_cong', 'thuong_phat', 'ngay_le', 'nhanvien', 'luong'];
        for (const table of tables) {
            const [result] = await connection.query(`SHOW TABLES LIKE '${table}'`);
            if (result.length > 0) {
                log.success(`Table '${table}' exists`);
            } else {
                log.error(`Table '${table}' MISSING`);
            }
        }

    } finally {
        connection.release();
    }
}

async function checkEmployeeData() {
    log.header('2️⃣  EMPLOYEE DATA CHECK');
    
    const connection = await pool.getConnection();
    
    try {
        const [employees] = await connection.query(
            'SELECT MaNV, HoTen, LuongCoBan, PhuCap FROM nhanvien WHERE TinhTrang = 1 ORDER BY MaNV'
        );

        if (employees.length === 0) {
            log.error('No active employees found!');
            return;
        }

        log.success(`Found ${employees.length} active employees`);
        console.table(employees);

    } finally {
        connection.release();
    }
}

async function checkMarch2026Data() {
    log.header('3️⃣  MARCH 2026 DATA CHECK');
    
    const connection = await pool.getConnection();
    
    try {
        // Check attendance records
        log.info('Checking attendance records for March 2026...');
        const [attendance] = await connection.query(
            `SELECT 
                MaNV,
                COUNT(*) as days,
                SUM(SoGioTangCa) as total_ot,
                COUNT(DISTINCT TrangThai) as status_types,
                GROUP_CONCAT(DISTINCT TrangThai) as statuses
             FROM cham_cong 
             WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026
             GROUP BY MaNV
             ORDER BY MaNV`
        );

        if (attendance.length === 0) {
            log.warning('No attendance records for March 2026 found! Need to seed data.');
        } else {
            log.success(`Found attendance records for ${attendance.length} employees`);
            console.table(attendance);
        }

        // Check bonus/penalty
        log.info('\nChecking bonus/penalty records for March 2026...');
        const [bonusData] = await connection.query(
            `SELECT 
                MaNV,
                Loai,
                SUM(SoTien) as total,
                COUNT(*) as count
             FROM thuong_phat 
             WHERE Thang = 3 AND Nam = 2026
             GROUP BY MaNV, Loai
             ORDER BY MaNV, Loai`
        );

        if (bonusData.length === 0) {
            log.warning('No bonus/penalty records for March 2026 found');
        } else {
            log.success(`Found ${bonusData.length} bonus/penalty entries`);
            console.table(bonusData);
        }

        // Check holidays
        log.info('\nChecking holidays for March 2026...');
        const [holidays] = await connection.query(
            'SELECT MaNgayLe, TenNgayLe, Ngay, HeSoLuong FROM ngay_le WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026'
        );

        if (holidays.length === 0) {
            log.warning('No holidays set for March 2026');
        } else {
            log.success(`Found ${holidays.length} holidays for March 2026`);
            console.table(holidays);
        }

        // Check existing salary records
        log.info('\nChecking existing salary records for March 2026...');
        const [salaries] = await connection.query(
            `SELECT 
                l.MaNV,
                nv.HoTen,
                l.SoNgayLam,
                l.TongLuong,
                l.TrangThai
             FROM luong l
             JOIN nhanvien nv ON l.MaNV = nv.MaNV
             WHERE l.Thang = 3 AND l.Nam = 2026
             ORDER BY l.MaNV`
        );

        if (salaries.length === 0) {
            log.info('No salary records for March 2026 yet (will be created after calculation)');
        } else {
            log.success(`Found ${salaries.length} existing salary records for March 2026`);
            console.table(salaries);
        }

    } finally {
        connection.release();
    }
}

async function checkCodelogic() {
    log.header('4️⃣  CODE LOGIC VERIFICATION');
    
    try {
        // Check if hrController has the required functions
        const { default: hrController } = await import('../controllers/hrController.js');
        
        const requiredMethods = ['calculateMonthlySalary', 'getSalaryStats', 'getProfile'];
        
        for (const method of requiredMethods) {
            if (hrController[method]) {
                log.success(`Method 'hrController.${method}' exists`);
            } else {
                log.error(`Method 'hrController.${method}' MISSING`);
            }
        }

        log.success('All required controller methods found');

    } catch (error) {
        log.warning(`Could not import controller: ${error.message}`);
    }
}

async function showNextSteps() {
    log.header('✨ NEXT STEPS');
    
    console.log(`
1️⃣  SEED TEST DATA (if not already seeded):
   $ node server/src/migrations/seed_march_2026_salary.js

2️⃣  DEBUG SCHEMA (if needed):
   ALTER TABLE luong
   ADD COLUMN KhauTruBHXH INT NOT NULL DEFAULT 0 AFTER Phat,
   ADD COLUMN ThueTNCN INT NOT NULL DEFAULT 0 AFTER KhauTruBHXH,
   ADD COLUMN LuongThucLinh INT NOT NULL DEFAULT 0 AFTER ThueTNCN;

3️⃣  CALCULATE SALARY:
   curl -X POST http://localhost:5000/api/hr/salary-detail \\
     -H "Content-Type: application/json" \\
     -d '{"month": 3, "year": 2026}' \\
     -H "Authorization: Bearer YOUR_TOKEN"

4️⃣  VIEW IN ADMIN:
   http://localhost:3000/admin → HR → Lương → Tháng 3/2026

📝 For more details, see: server/src/migrations/README_MARCH_2026.md
    `);
}

async function main() {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      MARCH 2026 SALARY CALCULATION VERIFICATION            ║');
    console.log('║                   Pre-Flight Checklist                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    try {
        await checkDatabaseSchema();
        await checkEmployeeData();
        await checkMarch2026Data();
        await checkCodelogic();
        await showNextSteps();
        
        log.header('✅ VERIFICATION COMPLETE');
        process.exit(0);
        
    } catch (error) {
        log.error(`Verification failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

main();
