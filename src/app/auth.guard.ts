import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

/**
 * Guard para proteger rutas mediante la autenticación de MSAL (Microsoft Authentication Library).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  /**
 * Constructor del guard.
 * @param msalService Servicio de MSAL para manejar la autenticación.
 * @param router Servicio de enrutamiento para redirigir a otras rutas.
 */
  constructor(private msalService: MsalService, private router: Router) { }

  /**
 * Verifica si el usuario tiene una sesión activa para permitir el acceso a la ruta protegida.
 * @returns `true` si el usuario está autenticado, de lo contrario, redirige al inicio de sesión y retorna `false`.
 */
  canActivate(): boolean {
    const account = this.msalService.instance.getActiveAccount();

    if (account) {
      // Usuario autenticado
      return true;
    } else {
      // Usuario no autenticado, redirigir al login
      console.warn('No se encontró una cuenta activa, redirigiendo al inicio de sesión.');
      this.router.navigate(['/']);
      return false;
    }
  }
}
