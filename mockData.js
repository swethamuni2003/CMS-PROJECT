// Local fallback data for offline / mobile testing when backend server is unreachable
export const mockRoles = [
  { _id: '660000000000000000000010', name: 'SuperAdmin' },
  { _id: '660000000000000000000011', name: 'User' },
  { _id: '660000000000000000000012', name: 'Staff' }
];

export const mockDepartments = [
  { _id: '660000000000000000000020', name: 'Computer Applications (MCA)', shortName: 'MCA' },
  { _id: '660000000000000000000021', name: 'Computer Science & Engineering', shortName: 'CSE' },
  { _id: '660000000000000000000022', name: 'Information Technology', shortName: 'IT' },
  { _id: '660000000000000000000023', name: 'Electronics & Communication Engineering', shortName: 'ECE' },
  { _id: '660000000000000000000024', name: 'Electrical & Electronics Engineering', shortName: 'EEE' },
  { _id: '660000000000000000000025', name: 'Mechanical Engineering', shortName: 'MECH' },
  { _id: '660000000000000000000026', name: 'Civil Engineering', shortName: 'CIVIL' },
  { _id: '660000000000000000000027', name: 'Artificial Intelligence & Data Science', shortName: 'AI&DS' },
  { _id: '660000000000000000000028', name: 'Master of Business Administration', shortName: 'MBA' },
  { _id: '660000000000000000000029', name: 'Science & Humanities', shortName: 'S&H' }
];

export const mockProgrammes = [
  { _id: '660000000000000000000030', name: 'Master of Computer Applications', code: 'MCA', department: mockDepartments[0] },
  { _id: '660000000000000000000031', name: 'B.Tech Computer Science & Engineering', code: 'B.Tech CSE', department: mockDepartments[1] },
  { _id: '660000000000000000000032', name: 'B.Tech Information Technology', code: 'B.Tech IT', department: mockDepartments[2] },
  { _id: '660000000000000000000033', name: 'B.E Electronics & Communication', code: 'ECE', department: mockDepartments[3] }
];

export const mockUsers = [
  {
    _id: '660000000000000000000001',
    username: 'admin',
    password: 'adminpassword',
    email: 'admin@tms.com',
    role: mockRoles[0],
    department: mockDepartments[0],
    phone: '9876543210'
  },
  {
    _id: '660000000000000000000002',
    username: 'user',
    password: 'userpassword',
    email: 'user@tms.com',
    role: mockRoles[1],
    department: mockDepartments[0],
    phone: '9876543211'
  },
  {
    _id: '660000000000000000000003',
    username: 'staff',
    password: 'staffpassword',
    email: 'staff@tms.com',
    role: mockRoles[2],
    department: mockDepartments[0],
    phone: '9876543212'
  }
];

export const mockBlocks = [
  { _id: '660000000000000000000040', name: 'Main Academic Block', department: mockDepartments[0], programme: mockProgrammes[0] },
  { _id: '660000000000000000000041', name: 'Computing Lab Annex', department: mockDepartments[0], programme: mockProgrammes[0] },
  { _id: '660000000000000000000042', name: 'Science & Research Block', department: mockDepartments[1], programme: mockProgrammes[1] }
];

export const mockRooms = [
  { _id: '660000000000000000000050', number: 'Lab 101', block: mockBlocks[0], department: mockDepartments[0], programme: mockProgrammes[0] },
  { _id: '660000000000000000000051', number: 'Seminar Hall B', block: mockBlocks[0], department: mockDepartments[0], programme: mockProgrammes[0] },
  { _id: '660000000000000000000052', number: 'IoT Systems Lab', block: mockBlocks[1], department: mockDepartments[0], programme: mockProgrammes[0] }
];

export let mockComplaints = [
  {
    _id: '660000000000000000000091',
    type: 'Network',
    department: 'Computer Applications (MCA)',
    block: mockBlocks[0],
    roomNumber: mockRooms[0],
    remarks: 'WiFi access point in Lab 101 is dropping connection intermittently.',
    status: 'In-Progress',
    raisedBy: mockUsers[1],
    assignedTo: mockUsers[2],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: '660000000000000000000092',
    type: 'PC Hardware',
    department: 'Computer Applications (MCA)',
    block: mockBlocks[0],
    roomNumber: mockRooms[1],
    remarks: 'Projector display is flickering with green artifacts during lectures.',
    status: 'Pending',
    raisedBy: mockUsers[1],
    assignedTo: null,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: '660000000000000000000093',
    type: 'PC Software',
    department: 'Computer Science & Engineering',
    block: mockBlocks[1],
    roomNumber: mockRooms[2],
    remarks: 'Node.js and VS Code development SDK needs updating on 20 workstations.',
    status: 'Completed',
    raisedBy: mockUsers[0],
    assignedTo: mockUsers[2],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export const getMockDashboardStats = () => {
  const total = mockComplaints.length;
  const pending = mockComplaints.filter(c => c.status === 'Pending').length;
  const assigned = mockComplaints.filter(c => c.status === 'Assigned').length;
  const inProgress = mockComplaints.filter(c => c.status === 'In-Progress').length;
  const completed = mockComplaints.filter(c => c.status === 'Completed').length;
  const closed = mockComplaints.filter(c => c.status === 'Closed').length;

  return {
    total,
    pending,
    assigned,
    inProgress,
    completed,
    closed
  };
};

export const addMockComplaint = (data, user) => {
  const blockObj = mockBlocks.find(b => b._id === data.block || b.name === data.block) || mockBlocks[0];
  const roomObj = mockRooms.find(r => r._id === data.roomNumber || r.number === data.roomNumber) || { number: 'Lab 101', block: blockObj };
  const deptName = data.department || user?.department?.name || 'Computer Applications (MCA)';

  const newTicket = {
    _id: 'mock_' + Date.now(),
    type: data.type || 'General',
    department: deptName,
    block: blockObj,
    roomNumber: roomObj,
    remarks: data.remarks || '',
    status: 'Pending',
    raisedBy: user || mockUsers[1],
    assignedTo: null,
    createdAt: new Date().toISOString()
  };

  mockComplaints.unshift(newTicket);
  return newTicket;
};

export const addMockDepartment = (data) => {
  const newDept = {
    _id: 'dept_' + Date.now(),
    name: data.name,
    shortName: data.shortName || data.name?.slice(0, 4).toUpperCase() || 'DEPT'
  };
  mockDepartments.push(newDept);
  return newDept;
};

export const addMockProgramme = (data) => {
  const dept = mockDepartments.find(d => d._id === data.department || d.name === data.department) || mockDepartments[0];
  const newProg = {
    _id: 'prog_' + Date.now(),
    name: data.name,
    code: data.code || data.name?.slice(0, 4).toUpperCase() || 'PROG',
    department: dept
  };
  mockProgrammes.push(newProg);
  return newProg;
};

export const addMockBlock = (data) => {
  const dept = mockDepartments.find(d => d._id === data.department || d.name === data.department) || mockDepartments[0];
  const prog = mockProgrammes.find(p => p._id === data.programme || p.name === data.programme) || mockProgrammes[0];
  const newBlock = {
    _id: 'block_' + Date.now(),
    name: data.name,
    department: dept,
    programme: prog
  };
  mockBlocks.push(newBlock);
  return newBlock;
};

export const addMockRoom = (data) => {
  const block = mockBlocks.find(b => b._id === data.block || b.name === data.block) || mockBlocks[0];
  const dept = mockDepartments.find(d => d._id === data.department || d.name === data.department) || block.department || mockDepartments[0];
  const prog = mockProgrammes.find(p => p._id === data.programme || p.name === data.programme) || block.programme || mockProgrammes[0];
  const newRoom = {
    _id: 'room_' + Date.now(),
    number: data.number,
    block: block,
    department: dept,
    programme: prog
  };
  mockRooms.push(newRoom);
  return newRoom;
};

export const addMockUser = (data) => {
  const role = mockRoles.find(r => r._id === data.role || r.name === data.role) || mockRoles[1];
  const dept = mockDepartments.find(d => d._id === data.department || d.name === data.department) || mockDepartments[0];
  const prog = mockProgrammes.find(p => p._id === data.programme || p.name === data.programme) || mockProgrammes[0];
  const newUser = {
    _id: 'user_' + Date.now(),
    username: data.username,
    email: data.email || `${data.username}@tms.com`,
    role: role,
    department: dept,
    programme: prog,
    phone: data.phone || '9876543210'
  };
  mockUsers.push({ ...newUser, password: data.password || 'userpassword' });
  return newUser;
};
