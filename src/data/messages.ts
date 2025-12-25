export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

export const mockMessages: Message[] = [
  {
    id: '1',
    roomId: 'room-1',
    senderId: 'user-1',
    senderName: 'John Doe',
    content: 'Hello, how are you?',
    timestamp: new Date('2024-01-15T10:30:00'),
    type: 'text',
  },
  {
    id: '2',
    roomId: 'room-1',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    content: 'I am doing great, thanks!',
    timestamp: new Date('2024-01-15T10:32:00'),
    type: 'text',
  },
  {
    id: '3',
    roomId: 'room-2',
    senderId: 'user-3',
    senderName: 'Bob Johnson',
    content: 'Meeting at 3 PM today',
    timestamp: new Date('2024-01-15T11:00:00'),
    type: 'text',
  },
  {
    id: '4',
    roomId: 'room-1',
    senderId: 'user-1',
    senderName: 'John Doe',
    content: 'Can you send me the document?',
    timestamp: new Date('2024-01-15T11:15:00'),
    type: 'text',
  },
  {
    id: '5',
    roomId: 'room-3',
    senderId: 'user-4',
    senderName: 'Alice Brown',
    content: 'Project update required',
    timestamp: new Date('2024-01-15T12:00:00'),
    type: 'text',
  },
  {
    id: '6',
    roomId: 'room-2',
    senderId: 'user-5',
    senderName: 'Charlie Wilson',
    content: 'Sounds good!',
    timestamp: new Date('2024-01-15T12:30:00'),
    type: 'text',
  },
  {
    id: '7',
    roomId: 'room-1',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    content: 'Sure, sending it now',
    timestamp: new Date('2024-01-15T13:00:00'),
    type: 'file',
  },
  {
    id: '8',
    roomId: 'room-4',
    senderId: 'user-6',
    senderName: 'David Lee',
    content: 'Team lunch tomorrow?',
    timestamp: new Date('2024-01-15T14:00:00'),
    type: 'text',
  },
  {
    id: '9',
    roomId: 'room-3',
    senderId: 'user-7',
    senderName: 'Emma Davis',
    content: 'I will prepare the slides',
    timestamp: new Date('2024-01-15T14:30:00'),
    type: 'text',
  },
  {
    id: '10',
    roomId: 'room-2',
    senderId: 'user-3',
    senderName: 'Bob Johnson',
    content: 'Great presentation today!',
    timestamp: new Date('2024-01-15T15:00:00'),
    type: 'text',
  },
  {
    id: '11',
    roomId: 'room-1',
    senderId: 'user-1',
    senderName: 'John Doe',
    content: 'Thanks for the help',
    timestamp: new Date('2024-01-15T15:30:00'),
    type: 'text',
  },
  {
    id: '12',
    roomId: 'room-5',
    senderId: 'user-8',
    senderName: 'Frank Miller',
    content: 'Code review needed',
    timestamp: new Date('2024-01-15T16:00:00'),
    type: 'text',
  },
];

