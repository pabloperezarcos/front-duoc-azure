import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { AlertaService, AlertaMedica } from '../services/alerta.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Lista de alertas médicas
  //alertas: any[] = [];
  alertas: AlertaMedica[] = [];

  // Variables de control
  escaneando: boolean = false;
  intervaloID: any;

  // Datos predefinidos para generación de alertas
  nombres = ['Juan Pérez', 'María López', 'Carlos García', 'Ana Martínez'];
  tipos = ['Cardiaca', 'Neurológica', 'Respiratoria'];
  niveles = ['Alta', 'Media', 'Baja'];

  constructor(
    private msalService: MsalService,
    private router: Router,
    private alertaService: AlertaService,
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {
    // Cargar alertas desde el backend al iniciar
    this.alertaService.obtenerAlertas().subscribe({
      next: (data) => (this.alertas = data),
      error: (error) => console.error('Error al cargar alertas:', error),
    });
  }


  // Iniciar generación de alertas
  iniciarEscaner(): void {
    if (!this.escaneando) {
      this.escaneando = true;
      this.intervaloID = setInterval(() => {
        const nuevaAlerta: AlertaMedica = {
          // Selecciona un nombre aleatorio de la lista
          nombrePaciente: this.nombres[Math.floor(Math.random() * this.nombres.length)],
          // Selecciona un tipo de alerta aleatorio
          tipoAlerta: this.tipos[Math.floor(Math.random() * this.tipos.length)],
          // Selecciona un nivel de alerta aleatorio
          nivelAlerta: this.niveles[Math.floor(Math.random() * this.niveles.length)],
          // Fecha actual
          fechaAlerta: new Date().toISOString(),
        };

        // Guardar alerta en el backend
        this.alertaService.guardarAlerta(nuevaAlerta).subscribe({
          next: (alerta) => this.alertas.push(alerta),
          error: (error) => console.error('Error al guardar alerta:', error),
        });
      }, 5000);
    }
  }

  // Detener generación de alertas
  detenerEscaner(): void {
    this.escaneando = false;
    clearInterval(this.intervaloID);
  }

  // Eliminar una alerta
  /*   eliminarAlerta(index: number): void {
      this.alertas.splice(index, 1);
    } */

  eliminarAlerta(index: number): void {
    const alertaId = this.alertas[index].idAlerta;
    if (alertaId) {
      this.alertaService.eliminarAlerta(alertaId).subscribe({
        next: () => this.alertas.splice(index, 1),
        error: (error) => console.error('Error al eliminar alerta:', error),
      });
    }
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