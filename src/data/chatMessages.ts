export interface ChatMessage {
  id: string
  text: string
  senderId: string
  senderName: string
  timestamp: Date
  avatar?: string
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hey everyone! How\'s it going?',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date('2024-01-15T10:00:00'),
  },
  {
    id: '2',
    text: 'Hi John! Doing great, thanks for asking. How about you?',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    timestamp: new Date('2024-01-15T10:01:30'),
  },
  {
    id: '3',
    text: 'Pretty good! Just working on some new features. Anyone up for a quick meeting later?',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date('2024-01-15T10:02:15'),
  },
  {
    id: '4',
    text: 'I\'m available around 2 PM if that works for everyone.',
    senderId: 'user-3',
    senderName: 'Bob Johnson',
    timestamp: new Date('2024-01-15T10:03:45'),
  },
  {
    id: '5',
    text: '2 PM works for me too! Let\'s do it.',
    senderId: 'user-4',
    senderName: 'Alice Brown',
    timestamp: new Date('2024-01-15T10:04:20'),
  },
  {
    id: '6',
    text: 'Perfect! I\'ll send a calendar invite.',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date('2024-01-15T10:05:00'),
  },
  {
    id: '7',
    text: 'Thanks John! Looking forward to it.',
    senderId: 'user-3',
    senderName: 'Bob Johnson',
    timestamp: new Date('2024-01-15T10:05:30'),
  },
  {
    id: '8',
    text: 'By the way, has anyone seen the latest design mockups?',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    timestamp: new Date('2024-01-15T10:10:15'),
  },
  {
    id: '9',
    text: 'Yes! I uploaded them to the shared drive. The new color scheme looks amazing!',
    senderId: 'user-4',
    senderName: 'Alice Brown',
    timestamp: new Date('2024-01-15T10:11:00'),
  },
  {
    id: '10',
    text: 'Agreed! The gradient on the buttons is really nice.',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date('2024-01-15T10:11:45'),
  },
  {
    id: '11',
    text: 'I\'m still working on the mobile responsive version. Should have it done by tomorrow.',
    senderId: 'user-3',
    senderName: 'Bob Johnson',
    timestamp: new Date('2024-01-15T10:12:30'),
  },
  {
    id: '12',
    text: 'Great work everyone! The project is really coming together.',
    senderId: 'user-2',
    senderName: 'Jane Smith',
    timestamp: new Date('2024-01-15T10:13:15'),
  },
  {
    id: '13',
    text: 'One more thing - the client called and they love the direction we\'re going in.',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date('2024-01-15T10:14:00'),
  },
  {
    id: '14',
    text: 'That\'s awesome news! 🎉',
    senderId: 'user-4',
    senderName: 'Alice Brown',
    timestamp: new Date('2024-01-15T10:14:30'),
  },
  {
    id: '15',
    text: 'Definitely a good sign. Let\'s keep up the momentum!',
    senderId: 'user-3',
    senderName: 'Bob Johnson',
    timestamp: new Date('2024-01-15T10:15:00'),
  },
]

export const currentUserId = 'user-1'
export const currentUserName = 'John Doe'
