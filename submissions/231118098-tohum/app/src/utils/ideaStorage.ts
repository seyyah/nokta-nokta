import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Idea } from '../types';

const IDEAS_KEY = 'nokta_ideas';

export const ideaStorage = {
  async loadIdeas(): Promise<Idea[]> {
    try {
      const raw = await AsyncStorage.getItem(IDEAS_KEY);
      if (!raw) return [];
      const ideas = JSON.parse(raw);
      return ideas.map((idea: Idea) => ({
        ...idea,
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt),
      }));
    } catch {
      return [];
    }
  },

  async saveIdeas(ideas: Idea[]): Promise<void> {
    await AsyncStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  },

  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    const ideas = await this.loadIdeas();
    const newIdea: Idea = {
      ...idea,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    ideas.unshift(newIdea);
    await this.saveIdeas(ideas);
    return newIdea;
  },

  async updateIdea(id: string, updates: Partial<Idea>): Promise<void> {
    const ideas = await this.loadIdeas();
    const index = ideas.findIndex((i) => i.id === id);
    if (index !== -1) {
      ideas[index] = { ...ideas[index], ...updates, updatedAt: new Date() };
      await this.saveIdeas(ideas);
    }
  },

  async deleteIdea(id: string): Promise<void> {
    const ideas = await this.loadIdeas();
    const filtered = ideas.filter((i) => i.id !== id);
    await this.saveIdeas(filtered);
  },
};
