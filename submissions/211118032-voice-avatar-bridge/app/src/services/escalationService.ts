import { Escalation, EscalationStatus } from '../types';
import { StorageHelper } from '../storage/storageHelper';

function generateId(): string {
  return `esc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getAllEscalations(): Promise<Escalation[]> {
  const data = await StorageHelper.getItem<Escalation[]>(StorageHelper.KEYS.ESCALATIONS);
  return data ?? [];
}

async function getEscalationById(id: string): Promise<Escalation | null> {
  const all = await getAllEscalations();
  return all.find((e) => e.id === id) ?? null;
}

async function createEscalation(topic: string, mentorType: string): Promise<Escalation> {
  const all = await getAllEscalations();
  const newEscalation: Escalation = {
    id: generateId(),
    topic,
    status: 'pending',
    createdAt: new Date().toISOString(),
    mentorType,
  };
  await StorageHelper.setItem(StorageHelper.KEYS.ESCALATIONS, [...all, newEscalation]);
  return newEscalation;
}

async function updateEscalationStatus(
  id: string,
  status: EscalationStatus,
): Promise<Escalation | null> {
  const all = await getAllEscalations();
  const index = all.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const updated: Escalation = { ...all[index], status };
  const newList = [...all];
  newList[index] = updated;
  await StorageHelper.setItem(StorageHelper.KEYS.ESCALATIONS, newList);
  return updated;
}

async function addSummaryToEscalation(id: string, summaryId: string): Promise<void> {
  const all = await getAllEscalations();
  const index = all.findIndex((e) => e.id === id);
  if (index === -1) return;

  const updated: Escalation = { ...all[index], summary: summaryId };
  const newList = [...all];
  newList[index] = updated;
  await StorageHelper.setItem(StorageHelper.KEYS.ESCALATIONS, newList);
}

async function acceptPendingEscalation(id: string): Promise<Escalation | null> {
  return updateEscalationStatus(id, 'accepted');
}

async function resolveEscalation(id: string): Promise<Escalation | null> {
  return updateEscalationStatus(id, 'resolved');
}

export const EscalationService = {
  getAllEscalations,
  getEscalationById,
  createEscalation,
  updateEscalationStatus,
  addSummaryToEscalation,
  acceptPendingEscalation,
  resolveEscalation,
};
