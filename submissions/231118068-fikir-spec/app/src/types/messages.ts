export interface MessageReply {
  id: string;
  text: string;
  from: string;
  time: string;
}

export interface ExpertMessage {
  id: string;
  expertId: string;
  expertName: string;
  userMessage: string;
  spec: string;
  date: string;
  time: string;
  replies: MessageReply[];
  read: boolean;
}
