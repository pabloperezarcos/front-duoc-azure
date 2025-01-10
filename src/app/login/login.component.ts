import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'Front-Duoc-Azure';
  isLoggedIn = false;

  constructor(private msalService: MsalService, private router: Router) { }

  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();
    this.isLoggedIn = !!account;

    // Si el usuario ya está autenticado, redirigir al dashboard
    if (this.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

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