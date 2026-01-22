import pool from '../config/connectDatabase.js';

/**
 * Middleware to check if the authenticated user has specific permissions for a feature.
 * @param {number} featureId - The ID of the feature (MaCN from chucnang).
 * @param {string} action - The action required (Xem, Them, Sua, Xoa, XuatFile, Duyet).
 */
export const checkPermission = (featureId, action) => {
    return async (req, res, next) => {
        try {
            // User info should be attached to req.user by current auth middleware
            const { MaNQ } = req.user;

            if (!MaNQ) {
                return res.status(403).json({ success: false, message: 'No role assigned to user' });
            }

            // Check phanquyen_chitiet for the user's role and feature
            const [rows] = await pool.query(
                `SELECT ?? AS allowed FROM phanquyen_chitiet WHERE MaNQ = ? AND MaCN = ?`,
                [action, MaNQ, featureId]
            );

            if (rows.length === 0 || !rows[0].allowed) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied: ${action} on feature ${featureId}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error.message);
            res.status(500).json({ success: false, message: 'Internal server error checking permissions' });
        }
    };
};
