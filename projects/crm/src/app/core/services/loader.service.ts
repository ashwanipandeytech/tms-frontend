import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private activeRequests = 0;
  isLoading = signal(false);

  showLoader() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.isLoading.set(true);
    }
  }

  hideLoader() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.isLoading.set(false);
    }
  }
}
