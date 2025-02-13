import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertaInfantil {
  idAlerta?: number;
  nombrePaciente: string;
  tipoAlerta: string;
  nivelAlerta: string;
  fechaAlerta: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertasInfantilesService {
  private apiUrl = 'http://localhost:3000/api/alertasInfantiles'; // URL del backend Kafka

  constructor(private http: HttpClient) { }

  obtenerAlertas(): Observable<AlertaInfantil[]> {
    return this.http.get<AlertaInfantil[]>(this.apiUrl);
  }

  guardarAlerta(alerta: AlertaInfantil): Observable<AlertaInfantil> {
    return this.http.post<AlertaInfantil>(this.apiUrl, alerta);
  }

  eliminarAlerta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
