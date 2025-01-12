import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Este componente maneja el inicio y cierre de sesión utilizando MSAL.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /**
   * Título del sistema mostrado en el login.
   */
  title = 'Front-Duoc-Azure';

  /**
   * Estado de la sesión del usuario.
   * `true` si el usuario está autenticado, de lo contrario `false`.
   */
  isLoggedIn = false;

  /**
   * Constructor del componente.
   * @param msalService Servicio de autenticación con MSAL.
   * @param router Router para la navegación entre componentes.
   */
  constructor(private msalService: MsalService, private router: Router) { }
  /**
    * Hook que se ejecuta al inicializar el componente.
    * Comprueba si el usuario está autenticado y, de ser así, redirige al dashboard.
    */
  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();
    this.isLoggedIn = !!account;

    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Inicia el proceso de login mediante un popup.
   * Si el login es exitoso, redirige al dashboard.
   */
  login() {
    this.msalService.loginPopup().subscribe({
      next: (result) => {
        console.log('Login success:', result);

        // Establece la cuenta activa
        const account = this.msalService.instance.getAllAccounts()[0];
        this.msalService.instance.setActiveAccount(account);

        this.isLoggedIn = true;

        // Redirigir al dashboard después del login
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoggedIn = false;
      },
    });
  }

  /**
    * Cierra la sesión del usuario actual.
    * Si el logout es exitoso, redirige al login.
    */
  logout() {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout success');
        this.isLoggedIn = false;

        // Redirigir al login después del logout
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }
}