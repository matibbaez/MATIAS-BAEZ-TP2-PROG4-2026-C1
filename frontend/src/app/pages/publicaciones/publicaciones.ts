import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './publicaciones.html'
})
export class PublicacionesComponent {}