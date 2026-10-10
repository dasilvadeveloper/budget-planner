import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAngularSvgIcon(),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'pt-PT' },
    provideLuxonDateAdapter(),
  ],
};
