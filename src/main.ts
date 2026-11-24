import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    if (!isDevMode() && 'serviceWorker' in navigator && window.isSecureContext) {
      // Offline caching is optional; failure never blocks the game.
      void navigator.serviceWorker.register(new URL('sw.js', document.baseURI), {
        updateViaCache: 'none'
      }).catch(() => undefined);
    }
  })
  .catch((err) => console.error(err));
