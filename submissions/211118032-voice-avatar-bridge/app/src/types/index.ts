import { NavigatorScreenParams } from '@react-navigation/native';

export type EscalationStatus = 'pending' | 'accepted' | 'resolved';

export type Escalation = {
  id: string;
  topic: string;
  status: EscalationStatus;
  createdAt: string;
  mentorType: string;
  summary?: string;
};

export type MessageSender = 'user' | 'mascot' | 'mentor';

export type Message = {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  senderName?: string;
};

export type MentorProfile = {
  id: string;
  name: string;
  expertise: string;
  avatarInitials: string;
  isOnline: boolean;
};

export type SessionSummary = {
  id: string;
  escalationId: string;
  topic: string;
  mentorName: string;
  mentorRecommendations: string[];
  nextSteps: string[];
  createdAt: string;
};

// Tab navigator screens (bottom bar) — Studio sekmesi Final hafta eklendi
export type TabParamList = {
  Home: undefined;
  Studio: undefined;
  Chat: undefined;
  Status: undefined;
  History: undefined;
};

// Root stack screens (full-screen flows over tabs)
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Mentor: { escalationId: string };
  Summary: { escalationId: string; summaryId: string };
  ExpertBridge: { roomName?: string; trigger?: 'manual' | 'auto'; stuckCycleId?: string };
};
