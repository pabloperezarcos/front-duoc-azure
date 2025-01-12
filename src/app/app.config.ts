import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

/**
 * Configuración principal de la aplicación Angular.
 * 
 * Este archivo define los proveedores globales necesarios para el correcto funcionamiento de la aplicación,
 * como el enrutador y la detección de cambios optimizada con zonas.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Configura la detección de cambios de Angular utilizando zonas.
     * - `eventCoalescing: true`: Optimiza los eventos de cambio para evitar múltiples detecciones innecesarias.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Proporciona las rutas definidas en el archivo `app.routes.ts` al enrutador global.
     */
    provideRouter(routes)]
};
