import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Representa una alerta médica.
 */
export interface AlertaMedica {
  /**
   * Identificador único de la alerta.
   * Opcional, ya que lo genera el backend.
   */
  idAlerta?: number;

  /**
   * Nombre del paciente asociado a la alerta.
   */
  nombrePaciente: string;

  /**
   * Tipo de alerta (e.g., Cardiaca, Neurológica, Respiratoria).
   */
  tipoAlerta: string;

  /**
   * Nivel de alerta (e.g., Alta, Media, Baja).
   */
  nivelAlerta: string;

  /**
   * Fecha y hora en la que se generó la alerta.
   */
  fechaAlerta: string;
}

/**
 * Servicio para gestionar las operaciones CRUD de las alertas médicas.
 */
@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  /**
 * URL base de la API de alertas médicas.
 */
  private apiUrl = 'http://localhost:8080/api/alertas';
  //private apiUrl = 'http://ip172-18-0-10-cuglrmi91nsg009s6qa0-8080.direct.labs.play-with-docker.com/api/alertas'

  //private apiUrl = 'https://srefrgfwmd.execute-api.us-east-1.amazonaws.com/api/alertas';

  /**
 * Constructor del servicio.
 * @param http Cliente HTTP para realizar solicitudes a la API.
 */
  constructor(private http: HttpClient) { }

  /**
 * Obtiene todas las alertas médicas desde el backend.
 * @returns Un observable que emite una lista de alertas médicas.
 */
  obtenerAlertas(): Observable<AlertaMedica[]> {
    return this.http.get<AlertaMedica[]>(this.apiUrl);
  }

  /**
 * Guarda una nueva alerta médica en el backend.
 * @param alerta La alerta médica que se desea guardar.
 * @returns Un observable que emite la alerta médica creada.
 */
  guardarAlerta(alerta: AlertaMedica): Observable<AlertaMedica> {
    return this.http.post<AlertaMedica>(this.apiUrl, alerta);
  }

  /**
 * Actualiza una alerta médica existente en el backend.
 * @param id El identificador único de la alerta que se desea actualizar.
 * @param alerta Los nuevos datos de la alerta médica.
 * @returns Un observable que emite la alerta médica actualizada.
 */
  actualizarAlerta(id: number, alerta: AlertaMedica): Observable<AlertaMedica> {
    return this.http.put<AlertaMedica>(`${this.apiUrl}/${id}`, alerta);
  }

  /**
 * Elimina una alerta médica del backend.
 * @param id El identificador único de la alerta que se desea eliminar.
 * @returns Un observable que se completa cuando la operación es exitosa.
 */
  eliminarAlerta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
