// src/lib/emotion.ts
// Local emotion/tone analysis with Transformers.js (GoEmotions ONNX)
// Provides multi-label distribution with normalized percentages and a convenient UI mapping.

import { pipeline, PipelineType } from '@huggingface/transformers';

// Singleton wrapper preserved across HMR in dev
const P = () =>
  class EmotionPipeline {
    static task: PipelineType = 'text-classification';
    static model = 'SamLowe/roberta-base-go_emotions-onnx';
    static instance: any = null;

    static async get(progress_callback?: (status: any) => void) {
      if (!this.instance) {
        this.instance = await pipeline(this.task, this.model, {
          progress_callback,
          dtype: 'fp32',
        });
      }
      return this.instance;
    }
  };

let EmotionPipeline: ReturnType<typeof P>;
if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  (global as any).EmotionPipeline ??= P();
  // @ts-ignore
  EmotionPipeline = (global as any).EmotionPipeline;
} else {
  EmotionPipeline = P();
}

export type EmotionItem = { label: string; score: number; pct: number };
export type EmotionAnalysis = { dist: EmotionItem[]; top: EmotionItem[] };

export async function analyzeEmotions(text: string): Promise<EmotionAnalysis> {
  const clf = await EmotionPipeline.get();
  // Request all labels if supported by the installed Transformers.js version
  const out = await clf(text, { topk: null });
  const scores = (Array.isArray(out) ? out : [out]) as Array<{ label: string; score: number }>;
  const sum = scores.reduce((a, b) => a + (b.score || 0), 0) || 1;
  const dist = scores
    .map(({ label, score }) => ({ label, score, pct: Math.round(((score || 0) / sum) * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
  const top = dist.slice(0, 3);
  return { dist, top };
}

// Optional deterministic aggregates for UI-friendly tags
const POSITIVE = new Set(['admiration','approval','caring','gratitude','joy','love','optimism','pride','relief']);
const NEGATIVE = new Set(['anger','annoyance','disappointment','disgust','fear','sadness','remorse','grief']);

export function synthesizeTone(dist: EmotionItem[]) {
  const sum = (labels: Set<string>) => dist.filter(x => labels.has(x.label)).reduce((a, b) => a + b.pct, 0);
  const positive = Math.round(sum(POSITIVE) * 10) / 10;
  const negative = Math.round(sum(NEGATIVE) * 10) / 10;
  const neutral = Math.max(0, Math.round((100 - positive - negative) * 10) / 10);
  return { positive, negative, neutral };
}

// Helper for mapping to the existing UI structure used by MessageDisplay
export function toUiEmotionDetails(dist: EmotionItem[]) {
  const primary = dist[0]?.label || 'neutral';
  const confidence = Math.round((dist[0]?.pct || 0) ) / 100; // convert to 0..1
  const all = dist.map(d => ({ emotion: d.label, score: d.pct / 100, isPrimary: d.label === primary }));
  return { primary, confidence, all } as { primary: string; confidence: number; all: { emotion: string; score: number; isPrimary: boolean }[] };
}
