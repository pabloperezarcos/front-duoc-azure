import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentRabbitmq } from '../environment/environment';

export interface AlertaMedica {
  idAlerta?: number;
  nombrePaciente: string;
  tipoAlerta: string;
  nivelAlerta: string;
  fechaAlerta: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertaService {

  private apiUrl = environmentRabbitmq.apiGatewayUrl;

  constructor(private http: HttpClient) { }

  obtenerAlertas(): Observable<AlertaMedica[]> {
    return this.http.get<AlertaMedica[]>(this.apiUrl);
  }

  guardarAlerta(alerta: AlertaMedica): Observable<AlertaMedica> {
    return this.http.post<AlertaMedica>(this.apiUrl, alerta);
  }

  actualizarAlerta(id: number, alerta: AlertaMedica): Observable<AlertaMedica> {
    return this.http.put<AlertaMedica>(`${this.apiUrl}/${id}`, alerta);
  }

  eliminarAlerta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
