export interface Message {
  id: string;
  text: string;
  username: string;
  country: string;
  timestamp: number;
  deviceId: string;
}

export interface Report {
  id: string;
  messageId: string;
  reason: string;
  timestamp: number;
}

export interface Presence {
  [key: string]: number;
}