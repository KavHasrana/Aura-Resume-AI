import { Injectable, signal, inject } from '@angular/core';
import { AIService, ResumeAnalysis } from './ai';

export type AppState = 'idle' | 'uploading' | 'processing' | 'results';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private ai = inject(AIService);
  
  state = signal<AppState>('idle');
  analysis = signal<ResumeAnalysis | null>(null);
  currentStep = signal<string>('');
  progress = signal<number>(0);

  async processResume(file: File) {
    this.state.set('uploading');
    this.progress.set(10);
    this.currentStep.set('Reading document structure...');

    // Simulate file reading
    const text = await this.readFileAsText(file);
    
    this.state.set('processing');
    this.progress.set(30);
    this.currentStep.set('Initializing Neural Engine...');
    await this.delay(800);

    this.progress.set(50);
    this.currentStep.set('Analyzing semantic patterns...');
    
    try {
      const result = await this.ai.analyzeResume(text);
      
      this.progress.set(80);
      this.currentStep.set('Synthesizing career insights...');
      await this.delay(1000);
      
      this.analysis.set(result);
      this.progress.set(100);
      this.currentStep.set('Analysis complete.');
      await this.delay(500);
      
      this.state.set('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      this.state.set('idle');
      // In a real app, we'd show an error toast
    }
  }

  reset() {
    this.state.set('idle');
    this.analysis.set(null);
    this.progress.set(0);
    this.currentStep.set('');
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsText(file);
    });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
