import {ChangeDetectionStrategy, Component, inject, effect, ElementRef, viewChild, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResumeService} from './services/resume';
import {animate, stagger} from "motion";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  resumeService = inject(ResumeService);
  resultsContainer = viewChild<ElementRef>('resultsContainer');
  floatingWordsContainer = viewChild<ElementRef>('floatingWordsContainer');
  isDragging = signal(false);

  constructor() {
    effect(() => {
      const state = this.resumeService.state();

      if (state === 'results') {
        setTimeout(() => {
          const resultsEl = this.resultsContainer()?.nativeElement;
          const floatingWordsEl = this.floatingWordsContainer()?.nativeElement;

          if (resultsEl) {
            const cards = resultsEl.querySelectorAll('.glass-panel');
            animate(
              cards,
              { opacity: [0, 1], y: [40, 0] },
              { delay: stagger(0.15), duration: 0.8, ease: "easeOut" }
            );

            // Role Alignment Lines Animation
            const lines = resultsEl.querySelectorAll('.match-line');
            animate(
              lines,
              { opacity: [0, 0.6], strokeDashoffset: [100, 0] },
              { delay: stagger(0.02), duration: 1.2, ease: "easeOut" }
            );

            // Score Count-up Animation
            const scoreEl = resultsEl.querySelector('.score-number');
            const targetScore = this.resumeService.analysis()?.score || 0;
            if (scoreEl) {
              animate(0, targetScore, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate: (latest) => {
                  scoreEl.textContent = Math.round(latest).toString();
                }
              });
            }
          }

          if (floatingWordsEl) {
            const words = floatingWordsEl.querySelectorAll('.floating-word');
            animate(
              words,
              { 
                opacity: [0, 1, 0], 
                x: [40, 300], 
                y: (i: number) => [100, 50 + (i * 15)],
                scale: [0.5, 1, 0.8]
              },
              { 
                delay: stagger(0.3), 
                duration: 2.5, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1
              }
            );
          }
        }, 100);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.resumeService.processResume(file);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.resumeService.processResume(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
}
