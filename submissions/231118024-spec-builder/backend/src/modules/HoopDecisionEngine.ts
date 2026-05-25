import { PiiResult } from './PiiInterceptor';

export interface HoopDecision {
  status: 'HOOTL' | 'HITL';
  ticketId?: string;
  reason?: string;
}

export interface Ticket {
  id: string;
  rawText: string;
  status: 'pending' | 'resolved' | 'rejected';
  createdAt: number;
  spec?: any;
}

export class HoopDecisionEngine {
  private static tickets: Ticket[] = [];

  public static evaluate(piiResult: PiiResult, rawText: string): HoopDecision {
    if (piiResult.hasRisk && piiResult.severity === 'CRITICAL') {
      const ticketId = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      this.tickets.push({
        id: ticketId,
        rawText,
        status: 'pending',
        createdAt: Date.now()
      });
      
      return {
        status: 'HITL',
        ticketId,
        reason: 'CRITICAL PII or Restricted Entity detected. Hard stop required.'
      };
    }

    return {
      status: 'HOOTL'
    };
  }

  public static getPendingTickets(): Ticket[] {
    return this.tickets.filter(t => t.status === 'pending');
  }

  public static getTicket(id: string): Ticket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  public static updateTicket(id: string, updates: Partial<Ticket>): void {
    const ticket = this.getTicket(id);
    if (ticket) {
      Object.assign(ticket, updates);
    }
  }
}
