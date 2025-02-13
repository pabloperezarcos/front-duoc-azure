import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AlertaService, AlertaMedica } from '../services/alerta.service';
import { Subscription, interval } from 'rxjs';
import { AlertasInfantilesService, AlertaInfantil } from '../services/alertas-infantiles.service';

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

  /** Alertas de Posta Adulto (RabbitMQ) */
  alertas: AlertaMedica[] = [];
  alertasFiltradas: AlertaMedica[] = [];

  escaneando: boolean = false;
  intervaloID: any;

  nombres = ['Pablo Pérez', 'María López', 'Byron Jaramillo', 'Ana Martínez'];
  tipos = ['Cardiaca', 'Neurológica', 'Respiratoria'];
  niveles = ['Alta', 'Media', 'Baja'];


  /** Alertas de Posta Infantil (Kafka) */
  alertasInfantiles: AlertaInfantil[] = [];
  alertasFiltradasInfantiles: AlertaInfantil[] = [];

  escaneandoInfantiles: boolean = false;
  intervaloInfantiles: any;

  nombresInfantiles = ['Pedro Gómez', 'Lucía Torres', 'Martín Díaz', 'Sofía Herrera'];
  tiposInfantiles = ['Cardiaca', 'Neurológica', 'Respiratoria'];
  nivelesInfantiles = ['Alta', 'Media', 'Baja'];


  /** MODAL PARA EDITAR */
  mostrarModal: boolean = false;
  alertaEditando: AlertaMedica = {
    idAlerta: 0,
    nombrePaciente: '',
    tipoAlerta: '',
    nivelAlerta: '',
    fechaAlerta: new Date().toISOString(),
  };

  filtroNombre: string = '';
  filtroNivel: string = '';

  contadorActualizacion: number = 10; // Cuenta regresiva para actualizar
  intervaloSub?: Subscription;

  // Variables para la paginación
  paginaActual: number = 1;
  alertasPorPagina: number = 10;

  paginaActualInfantil: number = 1;
  alertasPorPaginaInfantil: number = 10;


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
    private alertasInfantilesService: AlertasInfantilesService
  ) { }

  /**
   * Hook que se ejecuta al inicializar el componente.
   * Carga las alertas médicas desde el backend.
   */
  ngOnInit(): void {
    this.cargarAlertas();
    this.cargarAlertasInfantiles();

    // Configurar la actualización automática cada 10 segundos
    this.intervaloSub = interval(1000).subscribe(() => {
      if (this.contadorActualizacion === 0) {
        this.cargarAlertas();
        this.cargarAlertasInfantiles();
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

  cargarAlertasInfantiles(): void {
    this.alertasInfantilesService.obtenerAlertas().subscribe({
      next: (data) => {
        this.alertasInfantiles = data;
        this.alertasFiltradasInfantiles = data;
      },
      error: (error) => console.error('Error al cargar alertas Infantiles:', error),
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

  paginarAlertasInfantiles(): void {
    const inicio = (this.paginaActualInfantil - 1) * this.alertasPorPaginaInfantil;
    const fin = inicio + this.alertasPorPaginaInfantil;
    this.alertasFiltradasInfantiles = this.alertasInfantiles.slice(inicio, fin);
  }

  siguientePaginaInfantil(): void {
    if (this.paginaActualInfantil * this.alertasPorPaginaInfantil < this.alertasInfantiles.length) {
      this.paginaActualInfantil++;
      this.paginarAlertasInfantiles();
    }
  }

  anteriorPaginaInfantil(): void {
    if (this.paginaActualInfantil > 1) {
      this.paginaActualInfantil--;
      this.paginarAlertasInfantiles();
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

  iniciarEscanerInfantil(): void {
    if (!this.escaneandoInfantiles) {
      this.escaneandoInfantiles = true;
      this.intervaloInfantiles = setInterval(() => {
        const nuevaAlertaI: AlertaInfantil = {
          nombrePaciente: this.nombresInfantiles[Math.floor(Math.random() * this.nombresInfantiles.length)],
          tipoAlerta: this.tiposInfantiles[Math.floor(Math.random() * this.tiposInfantiles.length)],
          nivelAlerta: this.nivelesInfantiles[Math.floor(Math.random() * this.nivelesInfantiles.length)],
          fechaAlerta: new Date().toISOString(),
        };

        this.alertasInfantilesService.guardarAlerta(nuevaAlertaI).subscribe({
          next: (alerta) => this.alertasInfantiles.push(alerta),
          error: (error) => console.error('Error al guardar alerta infantil:', error),
        });
      }, 10000);
    }
  }

  detenerEscanerInfantil(): void {
    this.escaneandoInfantiles = false;
    clearInterval(this.intervaloInfantiles);
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


}