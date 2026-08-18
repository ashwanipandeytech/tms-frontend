import { Component, signal, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  isSidebarCollapsed = signal(false);
  currentTheme = signal('blue');
  expandedSections = signal<Set<string>>(new Set(['sales', 'inventory', 'cabs', 'finance', 'automation', 'admin', 'insights']));
  
  showShortcutToast = signal(false);
  hasUsedShortcut = signal(false);

  toggleSection(section: string) {
    if (this.isSidebarCollapsed()) {
      this.isSidebarCollapsed.set(false);
    }
    this.expandedSections.update(set => {
      const newSet = new Set(set);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }

  isExpanded(section: string): boolean {
    return this.expandedSections().has(section);
  }

  themes = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'violet', name: 'Violet', color: '#8b5cf6' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' }
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('app-theme') || 'blue';
      this.setTheme(savedTheme);
      this.hasUsedShortcut.set(localStorage.getItem('has-used-shortcut') === 'true');
    }
  }

  setTheme(themeId: string) {
    this.currentTheme.set(themeId);
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('app-theme', themeId);
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(val => !val);
  }

  closeToast() {
    this.showShortcutToast.set(false);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey) {
      const key = event.key.toLowerCase();
      let route = '';
      
      switch(key) {
        case 'd': route = '/dashboard'; break;
        case 'l': route = '/leads'; break;
        case 'f': route = '/follow-ups'; break;
        case 'c': route = '/coupons'; break;
        case 'q': route = '/quotations'; break;
        case 'i': route = '/itineraries'; break;
        case 'b': route = '/bookings'; break;
        case 'u': route = '/customers'; break;
      }
      
      if (route) {
        event.preventDefault();
        this.router.navigate([route]);
        
        if (!this.hasUsedShortcut()) {
          this.showShortcutToast.set(true);
          this.hasUsedShortcut.set(true);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('has-used-shortcut', 'true');
          }
          setTimeout(() => this.showShortcutToast.set(false), 5000);
        }
      }
    }
  }

}
