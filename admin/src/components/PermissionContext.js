import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No authToken found');
        setPermissions([]);
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/roles/user/permissions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        console.log('Permissions fetched:', response.data.data);
        setPermissions(response.data.data);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error.response?.data || error.message);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();

    // Listen for login events to refresh permissions
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' && e.newValue) {
        console.log('Auth token changed, refreshing permissions...');
        fetchPermissions();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab login
    const handleLoginEvent = () => {
      console.log('Login event detected, refreshing permissions...');
      setTimeout(() => fetchPermissions(), 100);
    };

    window.addEventListener('userLoggedIn', handleLoginEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
    };
    // eslint-disable-next-line
  }, []);

  // Normalize strings: remove diacritics, lowercase, trim
  const normalize = (s) => {
    if (!s && s !== '') return '';
    try {
      return String(s)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .trim();
    } catch (e) {
      // fallback for older environments without Unicode property escapes
      return String(s)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .trim();
    }
  };

  const hasPermission = (functionName, action) => {
    if (!permissions || permissions.length === 0) return false;

    const fnNorm = normalize(functionName);

    // Map friendly action names to database column names
    const actionMapping = {
      'xem': 'Xem',
      'doc': 'Xem',
      'them': 'Them',
      'sua': 'Sua',
      'xoa': 'Xoa',
      'xuat_file': 'XuatFile',
      'xuat': 'XuatFile',
      'duyet': 'Duyet'
    };

    const targetColumn = actionMapping[normalize(action)];
    if (!targetColumn) {
      console.warn(`Unknown action: ${action}`);
      return false;
    }

    const result = permissions.some((perm) => {
      const tenCnNorm = normalize(perm.TenCN);
      // Check if normalized function name matches OR is a sub-string (flexible)
      const matchesFunction = tenCnNorm === fnNorm || tenCnNorm.includes(fnNorm) || fnNorm.includes(tenCnNorm);

      if (matchesFunction) {
        return !!perm[targetColumn];
      }
      return false;
    });

    console.log(`Checking permission: [${functionName}] - [${action}] (${targetColumn}) => ${result}`);
    return result;
  };

  // Check permission by numeric feature id (MaCN). This is more reliable than matching names.
  const hasPermissionById = (featureId, action) => {
    if (!permissions || permissions.length === 0) return false;
    const actionMapping = {
      'xem': 'Xem',
      'doc': 'Xem',
      'them': 'Them',
      'sua': 'Sua',
      'xoa': 'Xoa',
      'xuat_file': 'XuatFile',
      'xuat': 'XuatFile',
      'duyet': 'Duyet'
    };
    const targetColumn = actionMapping[normalize(action)];
    if (!targetColumn) return false;
    const idNum = Number(featureId);
    if (Number.isNaN(idNum)) return false;
    const perm = permissions.find(p => Number(p.MaCN) === idNum);
    if (!perm) return false;
    return !!perm[targetColumn];
  };

  const refreshPermissions = async () => {
    setLoading(true);
    await fetchPermissions();
  };

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <PermissionContext.Provider
      value={{ permissions, setPermissions, hasPermission, hasPermissionById, loading, refreshPermissions }}
    >
      {children}
    </PermissionContext.Provider>
  );
};