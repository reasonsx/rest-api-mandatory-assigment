import { Injectable, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(false);

  constructor(private primeng: PrimeNG) {}

  init() {
    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {
      this.enableDark();
    }
  }

  toggle() {
    this.darkMode() ? this.disableDark() : this.enableDark();
  }

  enableDark() {
    this.darkMode.set(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }

  disableDark() {
    this.darkMode.set(false);
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}
