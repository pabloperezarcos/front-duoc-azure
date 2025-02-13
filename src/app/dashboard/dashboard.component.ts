import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AlertaService, AlertaMedica } from '../services/alerta.service';
import { Subscription, interval } from 'rxjs';
/* import { PdfService } from '../services/pdf.service'; */

/**
 * Este componente maneja el dashboard de alertas médicas.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  /**
   * Lista completa de alertas médicas obtenidas del backend.
   */
  alertas: AlertaMedica[] = [];

  /**
   * Lista de alertas médicas filtradas para mostrar en la tabla.
   */
  alertasFiltradas: AlertaMedica[] = [];

  /**
   * Estado de visibilidad del modal para editar alertas.
   */
  mostrarModal: boolean = false;

  /**
   * Alerta médica que se está editando actualmente.
   */
  alertaEditando: AlertaMedica = {
    idAlerta: 0,
    nombrePaciente: '',
    tipoAlerta: '',
    nivelAlerta: '',
    fechaAlerta: new Date().toISOString(),
  };

  /**
 * Filtro por nombre de paciente.
 */
  filtroNombre: string = '';

  /**
 * Filtro por nivel de alerta médica.
 */
  filtroNivel: string = '';

  /**
   * Indicador de si el escáner de alertas está en ejecución.
   */
  escaneando: boolean = false;

  /**
   * ID del intervalo para la generación de alertas automáticas.
   */
  intervaloID: any;

  /**
   * Lista de nombres de pacientes predefinidos para generar alertas.
   */
  nombres = ['Juan Pérez', 'María López', 'Carlos García', 'Ana Martínez'];

  /**
   * Lista de tipos de alerta predefinidos para generar alertas.
   */
  tipos = ['Cardiaca', 'Neurológica', 'Respiratoria'];

  /**
   * Lista de niveles de alerta predefinidos para generar alertas.
   */
  niveles = ['Alta', 'Media', 'Baja'];

  contadorActualizacion: number = 10; // Cuenta regresiva para actualizar
  intervaloSub?: Subscription;

  // Variables para la paginación
  paginaActual: number = 1;
  alertasPorPagina: number = 10;


  /**
   * Constructor del componente.
   * @param msalService Servicio de autenticación con MSAL.
   * @param router Router para la navegación entre componentes.
   * @param alertaService Servicio para gestionar alertas médicas.
   */
  constructor(
    private msalService: MsalService,
    private router: Router,
    private alertaService: AlertaService,
    /*     private pdfService: PdfService */
  ) { }

  /**
   * Hook que se ejecuta al inicializar el componente.
   * Carga las alertas médicas desde el backend.
   */
  ngOnInit(): void {
    this.cargarAlertas();

    // Configurar la actualización automática cada 10 segundos
    this.intervaloSub = interval(1000).subscribe(() => {
      if (this.contadorActualizacion === 0) {
        this.cargarAlertas();
        this.contadorActualizacion = 10; // Reiniciar contador
      } else {
        this.contadorActualizacion--;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervaloSub) {
      this.intervaloSub.unsubscribe();
    }
  }

  cargarAlertas(): void {
    this.alertaService.obtenerAlertas().subscribe({
      next: (data) => {
        this.alertas = data;
        this.paginarAlertas();
      },
      error: (error) => console.error('Error al cargar alertas:', error),
    });
  }

  paginarAlertas(): void {
    const inicio = (this.paginaActual - 1) * this.alertasPorPagina;
    const fin = inicio + this.alertasPorPagina;
    this.alertasFiltradas = this.alertas.slice(inicio, fin);
  }

  siguientePagina(): void {
    if (this.paginaActual * this.alertasPorPagina < this.alertas.length) {
      this.paginaActual++;
      this.paginarAlertas();
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.paginarAlertas();
    }
  }


  /**
   * Filtra las alertas médicas en base al nombre del paciente y al nivel de alerta.
   */
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

  /**
   * Inicia la generación automática de alertas médicas.
   */
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

  /**
   * Detiene la generación automática de alertas médicas.
   */
  detenerEscaner(): void {
    this.escaneando = false;
    clearInterval(this.intervaloID);
  }

  /**
   * Elimina una alerta médica de la lista.
   * @param index Índice de la alerta a eliminar.
   */
  eliminarAlerta(index: number): void {
    const alertaId = this.alertas[index].idAlerta;
    if (alertaId) {
      this.alertaService.eliminarAlerta(alertaId).subscribe({
        next: () => this.alertas.splice(index, 1),
        error: (error) => console.error('Error al eliminar alerta:', error),
      });
    }
  }

  /**
    * Abre el modal para editar una alerta médica.
    * @param index Índice de la alerta a editar.
    */
  editarAlerta(index: number): void {
    this.alertaEditando = { ...this.alertas[index] };
    this.mostrarModal = true; // Muestra el modal
    console.log('Modal visible:', this.mostrarModal);
  }

  /**
   * Guarda los cambios realizados en una alerta médica.
   */
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

  /**
   * Cierra el modal de edición y resetea la alerta en edición.
   */
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

  /**
   * Cierra la sesión del usuario actual y redirige al login.
   */
  logout(): void {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout completado');
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (error) => console.error('Logout error:', error)
    });
  }

  exportarPDF(): void {
    /*     this.pdfService.generarPDF(this.alertas); */
  }

}