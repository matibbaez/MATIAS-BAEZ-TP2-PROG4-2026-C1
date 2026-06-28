import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { NavbarComponent } from '../../components/navbar/navbar';
import { EstadisticasService } from '../../services/estadisticas';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, BaseChartDirective],
  templateUrl: './dashboard-estadisticas.html'
})
export class DashboardEstadisticasComponent implements OnInit {
  private estService = inject(EstadisticasService);

  cargando = true;
  error = '';

  fechaInicio = '';
  fechaFin = '';

  public barChartData: any = { labels: [], datasets: [] };
  public lineChartData: any = { labels: [], datasets: [] };
  public pieChartData: any = { labels: [], datasets: [] };

  public darkOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af', font: { family: 'monospace', size: 11 } } }
    },
    scales: {
      x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(31, 41, 55, 0.5)' } },
      y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(31, 41, 55, 0.5)' } }
    }
  };

  public pieOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 } } }
    }
  };

  ngOnInit() {
    this.inicializarFechas();
    this.consultarMetricas();
  }

  private inicializarFechas() {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);

    this.fechaFin = hoy.toISOString().slice(0, 10);
    this.fechaInicio = hace30.toISOString().slice(0, 10);
  }

  consultarMetricas() {
    this.cargando = true;
    this.error = '';

    forkJoin({
      barras: this.estService.getPubsPorUsuario(this.fechaInicio, this.fechaFin),
      lineas: this.estService.getComentariosTiempo(this.fechaInicio, this.fechaFin),
      torta: this.estService.getComentariosPorPost(this.fechaInicio, this.fechaFin)
    }).subscribe({
      next: (res) => {
        this.procesarBarras(res.barras);
        this.procesarLineas(res.lineas);
        this.procesarTorta(res.torta);
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron calcular las métricas en la base de datos.';
        this.cargando = false;
      }
    });
  }

  private procesarBarras(data: any[]) {
    this.barChartData = {
      labels: data.map(d => `@${d._id}`),
      datasets: [{
        data: data.map(d => d.cantidad),
        label: 'Publicaciones creadas',
        backgroundColor: 'rgba(59, 130, 246, 0.7)', 
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6
      }]
    };
  }

  private procesarLineas(data: any[]) {
    this.lineChartData = {
      labels: data.map(d => d._id),
      datasets: [{
        data: data.map(d => d.totalComentarios),
        label: 'Actividad diaria de debates',
        borderColor: '#10b981', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3
      }]
    };
  }

  private procesarTorta(data: any[]) {
    this.pieChartData = {
      labels: data.map(d => d.titulo.length > 18 ? `${d.titulo.substring(0, 18)}...` : d.titulo),
      datasets: [{
        data: data.map(d => d.cantidadComentarios),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#e11d48'],
        borderColor: '#111827',
        borderWidth: 2
      }]
    };
  }
}