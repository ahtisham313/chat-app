export type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended';
export type CallType = 'audio' | 'video';

export interface CallParticipant {
  name: string;
  avatar?: string;
}

