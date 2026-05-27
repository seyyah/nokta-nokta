export interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'seed' | 'growing' | 'mature';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  IdeaDetail: { ideaId: string };
  AddIdea: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};
