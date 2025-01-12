import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz de la aplicación.
 * 
 * Este componente actúa como el contenedor principal de la aplicación Angular. 
 * Renderiza las rutas proporcionadas por el `RouterOutlet` y define la estructura base de la interfaz.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /**
   * Título de la aplicación, utilizado como referencia en diversas secciones.
   */
  title = 'Front-Duoc-Azure';

}