import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AlertaService, AlertaMedica } from '../services/alerta.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Lista de alertas médicas
  alertas: AlertaMedica[] = [];
  alertasFiltradas: AlertaMedica[] = []; // Lista filtrada de alerta
  mostrarModal: boolean = false;

  alertaEditando: AlertaMedica = {
    idAlerta: 0,
    nombrePaciente: '',
    tipoAlerta: '',
    nivelAlerta: '',
    fechaAlerta: new Date().toISOString(),
  };

  filtroNombre: string = ''; // Valor del filtro por nombre
  filtroNivel: string = ''; // Valor del filtro por nivel de alerta

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
    private alertaService: AlertaService
  ) { }

  ngOnInit(): void {
    // Cargar alertas desde el backend al iniciar
    this.alertaService.obtenerAlertas().subscribe({
      next: (data) => {
        this.alertas = data;
        this.alertasFiltradas = data;
      },
      error: (error) => console.error('Error al cargar alertas:', error),
    });
  }

  filterPacientes(): void {
    this.alertasFiltradas = this.alertas.filter((alerta) => {
      const coincideNombre =
        !this.filtroNombre ||
        alerta.nombrePaciente
          .toLowerCase()
          .includes(this.filtroNombre.toLowerCase());
      const coincideNivel =
        !this.filtroNivel || alerta.nivelAlerta === this.filtroNivel;

      return coincideNombre && coincideNivel;
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

  // Mostrar el modal para editar una alerta
  editarAlerta(index: number): void {
    this.alertaEditando = { ...this.alertas[index] };
    this.mostrarModal = true; // Muestra el modal
    console.log('Modal visible:', this.mostrarModal);
  }

  // Guardar los cambios en la alerta
  guardarAlerta(): void {
    if (this.alertaEditando) {
      const index = this.alertas.findIndex(
        (alerta) => alerta.idAlerta === this.alertaEditando?.idAlerta
      );

      if (index !== -1 && this.alertaEditando.idAlerta) { // Asegúrate de que el id exista
        // Llamada al servicio para actualizar la alerta
        this.alertaService.actualizarAlerta(this.alertaEditando.idAlerta, this.alertaEditando).subscribe({
          next: (alertaActualizada) => {
            this.alertas[index] = alertaActualizada; // Actualizar la lista de alertas
            this.cerrarModal();
          },
          error: (error) => console.error('Error al actualizar la alerta:', error),
        });
      }
    }
  }

  // Cerrar el modal
  cerrarModal(): void {
    this.alertaEditando = {
      idAlerta: 0,
      nombrePaciente: '',
      tipoAlerta: '',
      nivelAlerta: '',
      fechaAlerta: new Date().toISOString(),
    };
    this.mostrarModal = false;
  }

  logout(): void {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout completado');
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (error) => console.error('Logout error:', error)
    });
  }

}