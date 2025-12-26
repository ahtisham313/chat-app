export interface Contact {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

// Mock contacts for testing - consistent naming with users
export const mockContacts: Contact[] = [
  {
    id: "user_1",
    name: "User 1",
    email: "user1@example.com",
  },
  {
    id: "user_2",
    name: "User 2",
    email: "user2@example.com",
  },
  {
    id: "user_3",
    name: "User 3",
    email: "user3@example.com",
  },
  {
    id: "user_4",
    name: "User 4",
    email: "user4@example.com",
  },
  {
    id: "user_5",
    name: "User 5",
    email: "user5@example.com",
  },
];

