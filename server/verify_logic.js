import pool from './src/config/connectDatabase.js';

function calculateWorkMinutes(gioVao, gioRa) {
    const timeToMinutes = (t) => {
        const parts = t.split(':').map(Number);
        return parts[0] * 60 + parts[1];
    };
    let totalMinutes = timeToMinutes(gioRa) - timeToMinutes(gioVao);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    return totalMinutes;
}

async function verifyLogic() {
    try {
        // Mock shift data (what we just set in DB)
        const shift = { GioBatDau: '08:00:00', GioKetThuc: '17:00:00', PhutNghi: 60 };
        const checkIn = '08:00:00';
        const checkOut = '17:00:00';

        // Logic from attendanceController.js
        let totalMinutes = calculateWorkMinutes(checkIn, checkOut);
        let standardMinutes = totalMinutes;
        
        // Break extraction logic
        if (standardMinutes > 300) { // > 5 hours
            standardMinutes -= shift.PhutNghi;
        }

        const soGioLam = (standardMinutes / 60).toFixed(2);
        
        console.log(`Check-in: ${checkIn}`);
        console.log(`Check-out: ${checkOut}`);
        console.log(`Total Minutes: ${totalMinutes}`);
        console.log(`Standard Minutes (after break): ${standardMinutes}`);
        console.log(`Calculated SoGioLam: ${soGioLam}`);

        if (soGioLam === '8.00') {
            console.log('✅ Verification SUCCESS: 8.00 hours calculated correctly.');
        } else {
            console.log('❌ Verification FAILED: Expected 8.00 hours.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyLogic();
