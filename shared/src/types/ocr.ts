export interface OcrResult {
  amount: number | null;
  title: string | null;
  category: string | null;
  date: string | null;
  confidence: number;
}