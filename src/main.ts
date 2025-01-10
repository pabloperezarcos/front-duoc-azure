import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// MSAL
import { MsalModule } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';


(async () => {
  // 1) Creas tu instancia de MSAL:
  const pca = new PublicClientApplication({
    auth: {
      clientId: '4715019b-f0dd-4c3d-9c5d-c6cabcc945b9',
      authority: 'https://login.microsoftonline.com/154990ff-5d59-40e6-ad84-28aacd6d84e0',
      redirectUri: 'http://localhost:4200',
    },
    // system: { asyncJIT: true }  // normalmente ya viene true por defecto en versiones nuevas
  });

  // 2) Esperas su inicialización
  await pca.initialize();

  // 3) Ahora sí importas MsalModule con esa instancia
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      provideHttpClient(),
      importProvidersFrom(
        BrowserModule,
        MsalModule.forRoot(
          pca,
          {
            interactionType: InteractionType.Popup,
            authRequest: { scopes: ['user.read'] },
          },
          {
            interactionType: InteractionType.Redirect,
            protectedResourceMap: new Map([
              ['https://graph.microsoft.com/v1.0/me', ['user.read']],
            ]),
          }
        )
      ),
    ]
  })
    .catch(err => console.error(err));
})();
