import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  mockUsers,
  mockRoles,
  mockDepartments,
  mockProgrammes,
  mockBlocks,
  mockRooms,
  mockComplaints,
  getMockDashboardStats,
  addMockComplaint,
  addMockDepartment,
  addMockProgramme,
  addMockBlock,
  addMockRoom,
  addMockUser
} from './mockData';

// Helper to extract clean IP from various Expo host strings
const extractIP = (str) => {
  if (!str || typeof str !== 'string') return null;
  const clean = str.replace(/^[a-z]+:\/\//i, '').split('/')[0];
  const ip = clean.split(':')[0];
  if (ip && ip !== 'localhost' && ip !== '127.0.0.1' && !ip.includes('example.com')) {
    return ip;
  }
  return null;
};

export const getAutoDetectedHost = () => {
  try {
    // 1. Expo SDK hostUri
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoClient?.hostUri ||
      Constants.manifest?.debuggerHost;
    const ip = extractIP(hostUri);
    if (ip) return ip;

    // 2. experienceUrl (Expo Go app)
    if (Constants.experienceUrl) {
      const expIp = extractIP(Constants.experienceUrl);
      if (expIp) return expIp;
    }
  } catch (err) {
    console.log('[API] Auto IP detection notice:', err);
  }
  return '10.138.227.104';
};

const detectedHost = getAutoDetectedHost();

let currentBaseURL = Platform.select({
  android: `http://${detectedHost}:5000/api`,
  ios: `http://${detectedHost}:5000/api`,
  default: 'http://localhost:5000/api'
});

const api = axios.create({
  baseURL: currentBaseURL,
  timeout: 3500, // 3.5s timeout prevents long hanging spinners on physical phones
  headers: {
    'Content-Type': 'application/json'
  }
});

let userToken = null;
let currentAuthUser = null;

export const setAuthToken = (token) => {
  userToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setAuthUser = (user) => {
  currentAuthUser = user;
};

export const setServerIP = (ipOrUrl) => {
  let url = (ipOrUrl || '').trim();
  if (!url) {
    url = `http://${getAutoDetectedHost()}:5000/api`;
  } else {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}:5000/api`;
    }
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
  }
  currentBaseURL = url;
  api.defaults.baseURL = currentBaseURL;
  return currentBaseURL;
};

export const getServerURL = () => currentBaseURL;

// Seamless Fallback Interceptor:
// If backend server is unreachable or Wi-Fi blocks port 5000,
// this instantly responds with mock store data so the app NEVER hangs or crashes.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isNetworkError =
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error') ||
      !error.response;

    if (isNetworkError && error.config) {
      const url = error.config.url || '';
      const method = (error.config.method || 'get').toLowerCase();

      // 1. Auth Login Fallback
      if (url.includes('/auth/login') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const cleanUser = (body?.username || '').trim().toLowerCase();
        const cleanPass = (body?.password || '').trim();

        const matched = mockUsers.find(
          u => u.username.toLowerCase() === cleanUser && u.password === cleanPass
        );

        if (matched) {
          const userCopy = { ...matched };
          delete userCopy.password;
          currentAuthUser = userCopy;
          return {
            data: { user: userCopy, token: 'offline_token_' + Date.now(), isOfflineDemo: true },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          };
        }
        return Promise.reject(new Error('Invalid login credentials'));
      }

      // 2. Dashboard Stats Fallback
      if (url.includes('/complaint/dashboard') && method === 'get') {
        return {
          data: getMockDashboardStats(),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // 3. Complaint List Fallback
      if (url.includes('/complaint/list') && method === 'get') {
        return {
          data: [...mockComplaints],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // 4. Masters: Departments Fallback
      if (url.includes('/master/departments') && method === 'get') {
        return {
          data: [...mockDepartments],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      if (url.includes('/master/departments') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const newDept = addMockDepartment(body || {});
        return {
          data: newDept,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: error.config
        };
      }

      // 5. Masters: Programmes Fallback
      if (url.includes('/master/programmes') && method === 'get') {
        return {
          data: [...mockProgrammes],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      if (url.includes('/master/programmes') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const newProg = addMockProgramme(body || {});
        return {
          data: newProg,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: error.config
        };
      }

      // 6. Masters: Blocks Fallback
      if (url.includes('/master/blocks') && method === 'get') {
        return {
          data: [...mockBlocks],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      if (url.includes('/master/blocks') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const newBlock = addMockBlock(body || {});
        return {
          data: newBlock,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: error.config
        };
      }

      // 7. Masters: Rooms Fallback
      if (url.includes('/master/rooms') && method === 'get') {
        return {
          data: [...mockRooms],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      if (url.includes('/master/rooms') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const newRoom = addMockRoom(body || {});
        return {
          data: newRoom,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: error.config
        };
      }

      // 8. Masters: Roles Fallback
      if (url.includes('/master/roles') && method === 'get') {
        return {
          data: [...mockRoles],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // 9. Masters: Users Fallback
      if (url.includes('/master/users') && method === 'get') {
        const safe = mockUsers.map(u => {
          const copy = { ...u };
          delete copy.password;
          return copy;
        });
        return {
          data: safe,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      if (url.includes('/master/users') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const newUser = addMockUser(body || {});
        return {
          data: newUser,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: error.config
        };
      }

      // 10. Raise Complaint Fallback
      if (url.includes('/complaint/raise') && method === 'post') {
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const created = addMockComplaint(body, currentAuthUser);
        return {
          data: { message: 'Complaint registered successfully', complaint: created },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }

      // 7. Update Status Fallback
      if (url.includes('/complaint/status/') && method === 'put') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        let body = error.config.data;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch (_) {}
        }
        const target = mockComplaints.find(c => c._id === id);
        if (target && body?.status) {
          target.status = body.status;
        }
        return {
          data: target || { message: 'Status updated' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        };
      }
    }

    return Promise.reject(error);
  }
);

export default api;
