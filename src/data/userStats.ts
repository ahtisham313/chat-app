export interface UserStat {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: 'active' | 'inactive' | 'away';
  lastSeen: Date;
  totalMessages: number;
  totalCalls: number;
  totalCallDuration: number; // in seconds
  avatar?: string;
}

export const mockUserStats: UserStat[] = [
  {
    id: 'user-1',
    userId: 'user-1',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    lastSeen: new Date('2024-01-15T19:30:00'),
    totalMessages: 45,
    totalCalls: 12,
    totalCallDuration: 7200,
  },
  {
    id: 'user-2',
    userId: 'user-2',
    userName: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    lastSeen: new Date('2024-01-15T19:25:00'),
    totalMessages: 38,
    totalCalls: 8,
    totalCallDuration: 5400,
  },
  {
    id: 'user-3',
    userId: 'user-3',
    userName: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    status: 'away',
    lastSeen: new Date('2024-01-15T18:30:00'),
    totalMessages: 52,
    totalCalls: 15,
    totalCallDuration: 9600,
  },
  {
    id: 'user-4',
    userId: 'user-4',
    userName: 'Alice Brown',
    email: 'alice.brown@example.com',
    status: 'active',
    lastSeen: new Date('2024-01-15T19:20:00'),
    totalMessages: 29,
    totalCalls: 6,
    totalCallDuration: 3600,
  },
  {
    id: 'user-5',
    userId: 'user-5',
    userName: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    status: 'active',
    lastSeen: new Date('2024-01-15T19:15:00'),
    totalMessages: 41,
    totalCalls: 10,
    totalCallDuration: 6300,
  },
  {
    id: 'user-6',
    userId: 'user-6',
    userName: 'David Lee',
    email: 'david.lee@example.com',
    status: 'inactive',
    lastSeen: new Date('2024-01-15T16:00:00'),
    totalMessages: 33,
    totalCalls: 9,
    totalCallDuration: 4800,
  },
  {
    id: 'user-7',
    userId: 'user-7',
    userName: 'Emma Davis',
    email: 'emma.davis@example.com',
    status: 'active',
    lastSeen: new Date('2024-01-15T19:10:00'),
    totalMessages: 27,
    totalCalls: 7,
    totalCallDuration: 4200,
  },
  {
    id: 'user-8',
    userId: 'user-8',
    userName: 'Frank Miller',
    email: 'frank.miller@example.com',
    status: 'away',
    lastSeen: new Date('2024-01-15T17:30:00'),
    totalMessages: 36,
    totalCalls: 11,
    totalCallDuration: 6900,
  },
];

