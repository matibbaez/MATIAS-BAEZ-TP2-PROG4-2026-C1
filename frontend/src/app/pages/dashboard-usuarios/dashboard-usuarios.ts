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
    // 1. Limpiamos los espacios en blanco de los extremos para que no nos caguen con "   "
    const nombre = this.nuevoUser.nombre?.trim() || '';
    const apellido = this.nuevoUser.apellido?.trim() || '';
    const correo = this.nuevoUser.correo?.trim() || '';
    const nombreUsuario = this.nuevoUser.nombreUsuario?.trim() || '';
    const contrasena = this.nuevoUser.contrasena?.trim() || '';
    const fechaNacimiento = this.nuevoUser.fechaNacimiento;

    // 2. Validación de campos vacíos
    if (!nombre || !apellido || !correo || !nombreUsuario || !contrasena || !fechaNacimiento) {
      this.errorCrear = 'Todos los campos son obligatorios y no pueden ser solo espacios.';
      return;
    }

    // 3. Validación de longitud
    if (nombre.length < 2 || apellido.length < 2 || nombreUsuario.length < 2) {
      this.errorCrear = 'El nombre, apellido y usuario deben tener al menos 2 caracteres.';
      return;
    }

    // 4. Validación de Correo (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      this.errorCrear = 'El formato del correo electrónico no es válido.';
      return;
    }

    // 5. Validación de Contraseña (Mínimo 8, 1 mayúscula, 1 minúscula, 1 número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(contrasena)) {
      this.errorCrear = 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.';
      return;
    }

    // 6. Validación de Edad y Fechas
    const fechaNacDate = new Date(fechaNacimiento);
    const hoy = new Date();

    if (fechaNacDate > hoy) {
      this.errorCrear = 'La fecha de nacimiento no puede ser en el futuro.';
      return;
    }

    let edad = hoy.getFullYear() - fechaNacDate.getFullYear();
    const mes = hoy.getMonth() - fechaNacDate.getMonth();
    
    // Si todavía no llegó su mes de cumpleaños, o es el mes pero no llegó el día, le restamos 1
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacDate.getDate())) {
      edad--;
    }

    if (edad < 16) {
      this.errorCrear = 'El usuario debe ser mayor de 16 años para ser registrado.';
      return;
    }

    this.nuevoUser.nombre = nombre;
    this.nuevoUser.apellido = apellido;
    this.nuevoUser.correo = correo;
    this.nuevoUser.nombreUsuario = nombreUsuario;
    this.nuevoUser.contrasena = contrasena;

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