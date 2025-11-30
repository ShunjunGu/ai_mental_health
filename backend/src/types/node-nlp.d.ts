declare module 'node-nlp' {
  export class NlpManager {
    constructor(options?: any);
    addLanguage(language: string): void;
    addDocument(language: string, text: string, intent: string): void;
    addAnswer(language: string, intent: string, answer: string): void;
    train(): Promise<void>;
    process(language: string, text: string): Promise<{
      intent: string | null;
      sentiment: {
        score: number;
      };
      score: number;
      entities: any[];
      classifications: Array<{
        intent: string;
        score: number;
      }>;
    }>;
  }
}