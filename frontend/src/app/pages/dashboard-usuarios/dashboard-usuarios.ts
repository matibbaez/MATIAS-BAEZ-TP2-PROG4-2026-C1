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

  formularioValido = false;
  erroresTiempoReal = {
    nombre: '',
    apellido: '',
    correo: '',
    nombreUsuario: '',
    contrasena: '',
    fechaNacimiento: ''
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
    this.limpiarFormulario(); 
    this.mostrarModalCrear = true;
    this.errorCrear = '';
  }

  cerrarModal() {
    this.mostrarModalCrear = false;
  }

  validarEnTiempoReal() {
    this.erroresTiempoReal = { nombre: '', apellido: '', correo: '', nombreUsuario: '', contrasena: '', fechaNacimiento: '' };
    this.formularioValido = true;

    const n = this.nuevoUser.nombre || '';
    const a = this.nuevoUser.apellido || '';
    const c = this.nuevoUser.correo || '';
    const u = this.nuevoUser.nombreUsuario || '';
    const p = this.nuevoUser.contrasena || '';
    const f = this.nuevoUser.fechaNacimiento;

    if (n.trim().length === 0 && n.length > 0) this.erroresTiempoReal.nombre = 'No puede contener solo espacios.';
    else if (n && n.trim().length < 2) this.erroresTiempoReal.nombre = 'Debe tener al menos 2 caracteres.';

    if (a.trim().length === 0 && a.length > 0) this.erroresTiempoReal.apellido = 'No puede contener solo espacios.';
    else if (a && a.trim().length < 2) this.erroresTiempoReal.apellido = 'Debe tener al menos 2 caracteres.';

    if (u.trim().length === 0 && u.length > 0) this.erroresTiempoReal.nombreUsuario = 'No puede contener solo espacios.';
    else if (u.includes(' ')) this.erroresTiempoReal.nombreUsuario = 'El usuario no puede tener espacios.';
    else if (u && u.trim().length < 2) this.erroresTiempoReal.nombreUsuario = 'Debe tener al menos 2 caracteres.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (c && !emailRegex.test(c)) this.erroresTiempoReal.correo = 'Formato de correo inválido.';

    const passRegex = /^(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/;
    if (p && !passRegex.test(p)) {
      this.erroresTiempoReal.contrasena = 'Mínimo 8 caracteres, 1 mayúscula, 1 número y sin espacios.';
    }

    if (f) {
      const fechaNacDate = new Date(f);
      const hoy = new Date();
      if (fechaNacDate > hoy) {
        this.erroresTiempoReal.fechaNacimiento = 'No puede ser una fecha futura.';
      } else {
        let edad = hoy.getFullYear() - fechaNacDate.getFullYear();
        const mes = hoy.getMonth() - fechaNacDate.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacDate.getDate())) edad--;
        
        if (edad < 16) this.erroresTiempoReal.fechaNacimiento = 'Debe ser mayor de 16 años.';
      }
    }

    const tieneErrores = Object.values(this.erroresTiempoReal).some(err => err !== '');
    const camposLlenos = n.trim() && a.trim() && c.trim() && u.trim() && p.trim() && f;

    this.formularioValido = !tieneErrores && !!camposLlenos;
  }

  registrarUsuarioAdmin() {
    this.creando = true;
    this.errorCrear = '';

    this.nuevoUser.nombre = this.nuevoUser.nombre.trim();
    this.nuevoUser.apellido = this.nuevoUser.apellido.trim();
    this.nuevoUser.correo = this.nuevoUser.correo.trim();
    this.nuevoUser.nombreUsuario = this.nuevoUser.nombreUsuario.trim();

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
    this.validarEnTiempoReal();
  }
}