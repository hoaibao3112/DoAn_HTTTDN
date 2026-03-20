#!/usr/bin/env node

/**
 * Script to seed March 2026 salary test data
 * Usage: node seed_march_2026_salary.js
 */

import pool from '../config/connectDatabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🔄 Starting March 2026 salary data migration...\n');

        // Read the SQL migration file
        const migrationPath = path.join(__dirname, 'seed_march_2026_salary.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

        // Split SQL file into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 0);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Execute each statement
        for (const statement of statements) {
            try {
                // Skip comments and empty lines
                if (statement.startsWith('--') || statement.startsWith('/*')) continue;

                // Execute the statement
                const result = await connection.query(statement);

                // Check if it's a SELECT statement (for verification queries)
                if (statement.trim().toUpperCase().startsWith('SELECT')) {
                    console.log('\n📊 Query Result:');
                    if (Array.isArray(result[0])) {
                        console.table(result[0]);
                    }
                    successCount++;
                } else if (statement.includes('INSERT IGNORE')) {
                    console.log('✅ Inserted/Skipped records (INSERT IGNORE)');
                    successCount++;
                } else if (statement.includes('UPDATE')) {
                    console.log('✅ Updated records');
                    successCount++;
                } else if (statement.includes('ALTER TABLE')) {
                    console.log('✅ Altered table structure');
                    successCount++;
                } else {
                    successCount++;
                }
            } catch (error) {
                // Ignore "duplicate entry" errors for INSERT IGNORE
                if (error.code === 'ER_DUP_ENTRY' || statement.includes('INSERT IGNORE')) {
                    skipCount++;
                } else {
                    console.error(`❌ Error: ${error.message}`);
                    console.error(`   Statement: ${statement.substring(0, 100)}...`);
                    errorCount++;
                }
            }
        }

        console.log('\n═══════════════════════════════════════════════');
        console.log('📋 Migration Summary:');
        console.log(`   ✅ Successful operations: ${successCount}`);
        console.log(`   ⏭️  Skipped (likely duplicates): ${skipCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log('═══════════════════════════════════════════════\n');

        // Verification queries
        console.log('📊 Data Verification:');
        
        const [attendanceCount] = await connection.query(
            `SELECT COUNT(*) as count FROM cham_cong 
             WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026`
        );
        console.log(`\n📅 Attendance records for March 2026: ${attendanceCount[0].count}`);

        const [bonusCount] = await connection.query(
            `SELECT COUNT(*) as count FROM thuong_phat 
             WHERE Thang = 3 AND Nam = 2026`
        );
        console.log(`💰 Bonus/Penalty records for March 2026: ${bonusCount[0].count}`);

        const [holidays] = await connection.query(
            `SELECT MaNgayLe, TenNgayLe, Ngay, HeSoLuong 
             FROM ngay_le 
             WHERE MONTH(Ngay) = 3 AND YEAR(Ngay) = 2026`
        );
        console.log(`🎉 Holidays in March 2026: ${holidays.length}`);
        if (holidays.length > 0) {
            console.table(holidays);
        }

        const [employeeAttendance] = await connection.query(
            `SELECT 
                nv.MaNV, 
                nv.HoTen, 
                COUNT(cc.MaCC) as days_attended,
                SUM(cc.SoGioTangCa) as total_ot_hours
             FROM nhanvien nv
             LEFT JOIN cham_cong cc ON nv.MaNV = cc.MaNV 
                AND MONTH(cc.Ngay) = 3 AND YEAR(cc.Ngay) = 2026
             WHERE nv.TinhTrang = 1
             GROUP BY nv.MaNV, nv.HoTen
             ORDER BY nv.MaNV`
        );
        
        console.log('\n👥 Employee Attendance Summary for March 2026:');
        console.table(employeeAttendance);

        console.log('\n✨ Migration completed successfully!\n');
        console.log('🎯 Next steps:');
        console.log('   1. Review the attendance data above');
        console.log('   2. Run the salary calculation API: POST /api/hr/salary-detail');
        console.log('   3. Check the results in the admin salary page');
        console.log('\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        connection.release();
        process.exit(0);
    }
}

// Run migration
runMigration();
