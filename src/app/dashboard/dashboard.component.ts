import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Lista de alertas médicas
  alertas: any[] = [];

  // Variables de control
  escaneando: boolean = false;
  intervaloID: any;

  // Datos predefinidos para generación de alertas
  nombres = ['Juan Pérez', 'María López', 'Carlos García', 'Ana Martínez'];
  tipos = ['Cardiaca', 'Neurológica', 'Respiratoria'];
  niveles = ['Alta', 'Media', 'Baja'];

  constructor(private msalService: MsalService, private router: Router) { }

  ngOnInit(): void {
    this.alertas = []; // Inicializa sin alertas
  }

  // Iniciar generación de alertas
  iniciarEscaner(): void {
    if (!this.escaneando) {
      this.escaneando = true;
      this.intervaloID = setInterval(() => {
        const nuevaAlerta = {
          nombrePaciente: this.nombres[Math.floor(Math.random() * this.nombres.length)],
          tipoAlerta: this.tipos[Math.floor(Math.random() * this.tipos.length)],
          nivelAlerta: this.niveles[Math.floor(Math.random() * this.niveles.length)],
          fechaAlerta: new Date().toLocaleString()
        };
        this.alertas.push(nuevaAlerta);
      }, 5000); // Genera cada 5 segundos
    }
  }

  // Detener generación de alertas
  detenerEscaner(): void {
    this.escaneando = false;
    clearInterval(this.intervaloID);
  }

  // Eliminar una alerta
  eliminarAlerta(index: number): void {
    this.alertas.splice(index, 1);
  }

  // Editar una alerta (puedes abrir un formulario modal)
  editarAlerta(index: number): void {
    const alerta = this.alertas[index];
    alert(`Editar alerta: ${JSON.stringify(alerta)}`);
    // Aquí podrías implementar un modal o navegación a otro componente para la edición.
  }

  logout(): void {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (error) => console.error('Logout error:', error)
    });
  }

}