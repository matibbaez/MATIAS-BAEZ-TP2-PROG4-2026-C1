import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { UsuariosService } from '../../services/usuarios';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard-usuarios.html'
})
export class DashboardUsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);

  listaUsuarios: any[] = [];
  cargando = true;
  mensajeAlerta = '';

  mostrarModalCrear = false;
  creando = false;
  errorCrear = '';

  nuevoUser = {
    nombre: '',
    apellido: '',
    correo: '',
    nombreUsuario: '',
    contrasena: '',
    fechaNacimiento: '',
    perfil: 'usuario' 
  };

  ngOnInit() {
    this.cargarLista();
  }

  cargarLista() {
    this.cargando = true;
    this.usuariosService.listarTodos().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al traer usuarios:', err);
        this.mensajeAlerta = 'Error de red o permisos insuficientes.';
        this.cargando = false;
      }
    });
  }

  alternarEstadoUsuario(user: any) {
    const accion$ = user.activo === false 
      ? this.usuariosService.rehabilitar(user._id)
      : this.usuariosService.deshabilitar(user._id);

    accion$.subscribe({
      next: (userActualizado) => {
        user.activo = userActualizado.activo;
        this.mostrarAvisotemporario(`El usuario @${user.nombreUsuario} fue ${user.activo ? 'rehabilitado' : 'deshabilitado'}.`);
      },
      error: () => this.mostrarAvisotemporario('No se pudo cambiar el estado en la base de datos.')
    });
  }

  private mostrarAvisotemporario(texto: string) {
    this.mensajeAlerta = texto;
    setTimeout(() => this.mensajeAlerta = '', 4000);
  }

  abrirModal() {
    this.mostrarModalCrear = true;
    this.errorCrear = '';
  }

  cerrarModal() {
    this.mostrarModalCrear = false;
  }

  registrarUsuarioAdmin() {
    if (!this.nuevoUser.correo || !this.nuevoUser.nombreUsuario || !this.nuevoUser.contrasena) {
      this.errorCrear = 'Por favor completá los campos obligatorios.';
      return;
    }

    this.creando = true;
    this.errorCrear = '';

    this.usuariosService.crearUsuarioAdmin(this.nuevoUser).subscribe({
      next: (userCreado) => {
        this.listaUsuarios.unshift(userCreado); 
        this.creando = false;
        this.mostrarModalCrear = false;
        this.limpiarFormulario();
        this.mostrarAvisotemporario(`Usuario @${userCreado.nombreUsuario} creado con éxito.`);
      },
      error: (err) => {
        this.creando = false;
        this.errorCrear = err.error?.message || 'Error al intentar registrar el usuario.';
      }
    });
  }

  private limpiarFormulario() {
    this.nuevoUser = {
      nombre: '', apellido: '', correo: '', nombreUsuario: '',
      contrasena: '', fechaNacimiento: '', perfil: 'usuario'
    };
  }
}