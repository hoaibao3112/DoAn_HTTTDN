/**
 * Permission Helper Functions
 * 
 * File này chứa các helper functions để làm việc với permissions.
 * Các functions này tái sử dụng được và giúp code clean hơn.
 * 
 * @module utils/permissionHelpers
 */

import pool from '../config/connectDatabase.js';
import { VALID_ACTIONS, PERMISSIONS, getFeatureName } from '../constants/permissions.js';

/**
 * Lấy tất cả quyền của một nhóm quyền
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @returns {Promise<Array>} Danh sách quyền chi tiết
 * 
 * @example
 * const permissions = await getUserPermissions(1);
 * console.log(permissions);
 * // [
 * //   { MaNQ: 1, MaCN: 6, TenCN: 'Danh sách nhân viên', Xem: 1, Them: 1, ... },
 * //   ...
 * // ]
 */
export async function getUserPermissions(MaNQ) {
    try {
        const [permissions] = await pool.query(`
      SELECT 
        ct.*,
        cn.TenCN,
        cn.URL,
        cn.Icon,
        cn.MaCha
      FROM phanquyen_chitiet ct
      JOIN chucnang cn ON ct.MaCN = cn.MaCN
      WHERE ct.MaNQ = ? AND cn.TinhTrang = 1
      ORDER BY cn.ThuTu, cn.MaCN
    `, [MaNQ]);

        return permissions;
    } catch (error) {
        console.error('Error in getUserPermissions:', error);
        throw error;
    }
}

/**
 * Kiểm tra một nhóm quyền có quyền cụ thể hay không
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @param {number} featureId - ID chức năng
 * @param {string} action - Hành động (Xem, Them, Sua, Xoa, XuatFile, Duyet)
 * @returns {Promise<boolean>} True nếu có quyền
 * 
 * @example
 * const canView = await hasPermission(1, 6, 'Xem');
 * if (canView) {
 *   // User có quyền xem nhân viên
 * }
 */
export async function hasPermission(MaNQ, featureId, action) {
    try {
        // Validate action
        if (!VALID_ACTIONS.includes(action)) {
            throw new Error(`Invalid action: ${action}`);
        }

        const query = `
      SELECT ${action} AS hasPermission 
      FROM phanquyen_chitiet 
      WHERE MaNQ = ? AND MaCN = ?
    `;

        const [rows] = await pool.query(query, [MaNQ, featureId]);
        return rows.length > 0 && rows[0].hasPermission === 1;
    } catch (error) {
        console.error('Error in hasPermission:', error);
        throw error;
    }
}

/**
 * Lấy menu theo quyền của user (chỉ hiển thị menu có quyền Xem)
 * Trả về cấu trúc tree với parent-children
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @returns {Promise<Array>} Menu items dạng tree structure
 * 
 * @example
 * const menu = await getMenuByRole(1);
 * // [
 * //   { MaCN: 5, TenCN: 'Quản lý nhân sự', children: [
 * //     { MaCN: 6, TenCN: 'Danh sách nhân viên', children: [] },
 * //     ...
 * //   ]},
 * //   ...
 * // ]
 */
export async function getMenuByRole(MaNQ) {
    try {
        const [menu] = await pool.query(`
      SELECT DISTINCT
        cn.MaCN,
        cn.TenCN,
        cn.MaCha,
        cn.URL,
        cn.Icon,
        cn.ThuTu
      FROM chucnang cn
      JOIN phanquyen_chitiet ct ON cn.MaCN = ct.MaCN
      WHERE ct.MaNQ = ? 
        AND cn.TinhTrang = 1
        AND ct.Xem = 1
      ORDER BY cn.ThuTu, cn.MaCN
    `, [MaNQ]);

        // Tạo cấu trúc tree
        const menuTree = [];
        const menuMap = new Map();

        // Tạo map với tất cả items
        menu.forEach(item => {
            menuMap.set(item.MaCN, { ...item, children: [] });
        });

        // Build tree structure
        menuMap.forEach(item => {
            if (item.MaCha === null) {
                // Root level items
                menuTree.push(item);
            } else {
                // Child items - add to parent
                const parent = menuMap.get(item.MaCha);
                if (parent) {
                    parent.children.push(item);
                } else {
                    // Parent không có quyền, add vào root
                    menuTree.push(item);
                }
            }
        });

        return menuTree;
    } catch (error) {
        console.error('Error in getMenuByRole:', error);
        throw error;
    }
}

/**
 * Lấy danh sách tất cả các actions có thể
 * 
 * @returns {Array<string>} Danh sách actions
 * 
 * @example
 * const actions = getAllActions();
 * // ['Xem', 'Them', 'Sua', 'Xoa', 'XuatFile', 'Duyet']
 */
export function getAllActions() {
    return VALID_ACTIONS;
}

/**
 * Lấy quyền của một nhóm quyền cho một chức năng cụ thể
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @param {number} featureId - ID chức năng
 * @returns {Promise<Object|null>} Object chứa các quyền hoặc null nếu không tìm thấy
 * 
 * @example
 * const perms = await getFeaturePermissions(1, 6);
 * // { Xem: 1, Them: 1, Sua: 0, Xoa: 0, XuatFile: 1, Duyet: 0 }
 */
export async function getFeaturePermissions(MaNQ, featureId) {
    try {
        const [rows] = await pool.query(`
      SELECT Xem, Them, Sua, Xoa, XuatFile, Duyet
      FROM phanquyen_chitiet
      WHERE MaNQ = ? AND MaCN = ?
    `, [MaNQ, featureId]);

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error in getFeaturePermissions:', error);
        throw error;
    }
}

/**
 * Kiểm tra nhiều quyền cùng lúc
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @param {number} featureId - ID chức năng
 * @param {Array<string>} actions - Danh sách actions cần kiểm tra
 * @returns {Promise<Object>} Object với key là action, value là boolean
 * 
 * @example
 * const perms = await checkMultiplePermissions(1, 6, ['Xem', 'Them', 'Sua']);
 * // { Xem: true, Them: true, Sua: false }
 */
export async function checkMultiplePermissions(MaNQ, featureId, actions) {
    try {
        const permissions = await getFeaturePermissions(MaNQ, featureId);

        if (!permissions) {
            // Không có quyền gì cả
            return actions.reduce((acc, action) => {
                acc[action] = false;
                return acc;
            }, {});
        }

        return actions.reduce((acc, action) => {
            acc[action] = permissions[action] === 1;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error in checkMultiplePermissions:', error);
        throw error;
    }
}

/**
 * Lấy danh sách các chức năng mà user có quyền thực hiện một action cụ thể
 * VD: Lấy tất cả chức năng mà user có quyền "Xem"
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @param {string} action - Hành động
 * @returns {Promise<Array<number>>} Danh sách feature IDs
 * 
 * @example
 * const viewableFeatures = await getFeaturesByAction(1, 'Xem');
 * // [1, 2, 3, 6, 7, 8, ...]
 */
export async function getFeaturesByAction(MaNQ, action) {
    try {
        if (!VALID_ACTIONS.includes(action)) {
            throw new Error(`Invalid action: ${action}`);
        }

        const query = `
      SELECT MaCN
      FROM phanquyen_chitiet
      WHERE MaNQ = ? AND ${action} = 1
    `;

        const [rows] = await pool.query(query, [MaNQ]);
        return rows.map(row => row.MaCN);
    } catch (error) {
        console.error('Error in getFeaturesByAction:', error);
        throw error;
    }
}

/**
 * Kiểm tra xem một nhóm quyền có bất kỳ quyền nào trên một feature không
 * 
 * @param {number} MaNQ - ID nhóm quyền
 * @param {number} featureId - ID chức năng
 * @returns {Promise<boolean>} True nếu có ít nhất 1 quyền
 */
export async function hasAnyPermission(MaNQ, featureId) {
    try {
        const [rows] = await pool.query(`
      SELECT 
        (Xem + Them + Sua + Xoa + XuatFile + Duyet) AS totalPermissions
      FROM phanquyen_chitiet
      WHERE MaNQ = ? AND MaCN = ?
    `, [MaNQ, featureId]);

        return rows.length > 0 && rows[0].totalPermissions > 0;
    } catch (error) {
        console.error('Error in hasAnyPermission:', error);
        throw error;
    }
}

/**
 * Format permissions thành object dễ đọc cho frontend
 * 
 * @param {Array} permissions - Raw permissions từ database
 * @returns {Object} Formatted permissions by feature
 * 
 * @example
 * const raw = await getUserPermissions(1);
 * const formatted = formatPermissionsForFrontend(raw);
 * // {
 * //   6: { feature: 'Danh sách nhân viên', Xem: true, Them: true, ... },
 * //   7: { feature: 'Chấm công', Xem: true, Them: false, ... }
 * // }
 */
export function formatPermissionsForFrontend(permissions) {
    return permissions.reduce((acc, perm) => {
        acc[perm.MaCN] = {
            feature: perm.TenCN,
            url: perm.URL,
            icon: perm.Icon,
            permissions: {
                view: perm.Xem === 1,
                create: perm.Them === 1,
                update: perm.Sua === 1,
                delete: perm.Xoa === 1,
                export: perm.XuatFile === 1,
                approve: perm.Duyet === 1
            }
        };
        return acc;
    }, {});
}
