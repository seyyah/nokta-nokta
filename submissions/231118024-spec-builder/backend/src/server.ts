import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PiiInterceptor } from './modules/PiiInterceptor';
import { HoopDecisionEngine } from './modules/HoopDecisionEngine';
import { TrackAService } from './modules/TrackAService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 2. Statik Dosya Sunumu
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/idea', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idea } = req.body;

    if (!idea) {
      res.status(400).json({ error: 'Idea is required' });
      return;
    }

    // 1. Edge Guardrail: Intercept and analyze PII
    const piiResult = PiiInterceptor.analyze(idea);

    // 2. Decision Engine: Decide workflow
    // Notice we pass the raw 'idea' text to store in the ticket if it fails
    const decision = HoopDecisionEngine.evaluate(piiResult, idea);

    if (decision.status === 'HITL') {
      res.status(403).json({
        status: 'escalated',
        ticketId: decision.ticketId,
        message: 'Escalated to Human-in-the-Loop due to security policy violations.',
        reason: decision.reason
      });
      return;
    }

    // 3. Clean Room LLM: Generate Spec using safe text
    const spec = await TrackAService.generateSpec(piiResult.maskedText);

    res.json({
      status: 'success',
      workflow: 'HOOTL',
      spec
    });
  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1. Bilet (Ticket) API Rotaları
app.get('/api/tickets', (req: Request, res: Response) => {
  res.json(HoopDecisionEngine.getPendingTickets());
});

app.post('/api/tickets/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { action, maskedText } = req.body; // action: 'approve' | 'reject'

    const ticket = HoopDecisionEngine.getTicket(id);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    if (action === 'reject') {
      HoopDecisionEngine.updateTicket(id, { status: 'rejected' });
      res.json({ status: 'success', message: 'Ticket rejected' });
      return;
    }

    if (action === 'approve') {
      if (!maskedText) {
        res.status(400).json({ error: 'maskedText is required for approval' });
        return;
      }

      // Send the DPO-approved maskedText to LLM (Track A)
      const spec = await TrackAService.generateSpec(maskedText);
      HoopDecisionEngine.updateTicket(id, { status: 'resolved', spec });
      res.json({ status: 'success', spec });
      return;
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Resolve error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
