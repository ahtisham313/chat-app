import { ref, push, set, query, limitToLast, onValue, off, serverTimestamp, DataSnapshot } from "firebase/database";
import { db } from "./firebase/config";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  roomId: string;
}

export interface MessageInput {
  text: string;
  senderId: string;
  senderName: string;
  roomId: string;
}

/**
 * Generate a consistent roomId from two user IDs
 * Sorts IDs to ensure same room for both users
 */
export function getRoomId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

/**
 * Send a message to a specific room
 * Uses serverTimestamp for consistent time across devices
 */
export async function sendMessage(message: MessageInput): Promise<void> {
  try {
    const messagesRef = ref(db, `messages/${message.roomId}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      text: message.text,
      senderId: message.senderId,
      senderName: message.senderName,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

/**
 * Listen to messages from a specific room
 * Returns last 50 messages in real-time
 * @param roomId - The room ID to listen to
 * @param callback - Function called when messages change
 * @returns Cleanup function to unsubscribe
 */
export function listenMessages(
  roomId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = ref(db, `messages/${roomId}`);
  const messagesQuery = query(messagesRef, limitToLast(50));

  const unsubscribe = onValue(
    messagesQuery,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messages: Message[] = Object.keys(messagesData)
          .map((key) => {
            const message = messagesData[key];
            // Handle serverTimestamp: Firebase returns null initially, then converts to number (milliseconds)
            const timestamp = message.timestamp || Date.now();
            return {
              id: key,
              text: message.text || "",
              senderId: message.senderId || "",
              senderName: message.senderName || "",
              timestamp: typeof timestamp === "number" ? timestamp : Date.now(),
              roomId: roomId,
            };
          })
          .filter((msg) => msg.timestamp > 0) // Filter out invalid timestamps
          .sort((a, b) => a.timestamp - b.timestamp);

        callback(messages);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error("Error listening to messages:", error);
      callback([]);
    }
  );

  // Return cleanup function
  return () => {
    off(messagesQuery);
  };
}

/**
 * Get the last message from a room (for conversation preview)
 */
export function getLastMessage(
  roomId: string,
  callback: (message: Message | null) => void
): () => void {
  const messagesRef = ref(db, `messages/${roomId}`);
  const messagesQuery = query(messagesRef, limitToLast(1));

  const unsubscribe = onValue(
    messagesQuery,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const keys = Object.keys(messagesData);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          const message = messagesData[lastKey];
          const timestamp = message.timestamp || Date.now();
          callback({
            id: lastKey,
            text: message.text || "",
            senderId: message.senderId || "",
            senderName: message.senderName || "",
            timestamp: typeof timestamp === "number" ? timestamp : Date.now(),
            roomId: roomId,
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error getting last message:", error);
      callback(null);
    }
  );

  return () => {
    off(messagesQuery);
  };
}
