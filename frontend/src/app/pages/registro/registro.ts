import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm: FormGroup;
  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;
  cargando = false;
  mensajeError = '';

  constructor() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, this.validarNoVacio, Validators.minLength(2)]],
      apellido: ['', [Validators.required, this.validarNoVacio, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, this.validarNoVacio, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(8), this.validarContrasenaSegura]],
      repetirContrasena: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, this.validarEdadMinima]], 
      descripcion: ['', [Validators.maxLength(250)]], 
      perfil: ['usuario', [Validators.required]] 
    }, { 
      validators: this.validarCoincidenciaContrasenas 
    });
  }

  private validarNoVacio(control: AbstractControl): ValidationErrors | null {
    const texto = (control.value || '').trim();
    return texto.length === 0 ? { soloEspacios: true } : null;
  }

  private validarEdadMinima(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const fechaNacimiento = new Date(control.value);
    const hoy = new Date();
    if (fechaNacimiento > hoy) return { fechaFutura: true };

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;

    return edad < 16 ? { menorDe16: true } : null;
  }

  private validarContrasenaSegura(control: AbstractControl): ValidationErrors | null {
    const clave = control.value || '';
    const tieneMayuscula = /[A-Z]/.test(clave);
    const tieneNumero = /[0-9]/.test(clave);
    return !(tieneMayuscula && tieneNumero) ? { claveInsegura: true } : null;
  }

  private validarCoincidenciaContrasenas(formGroup: AbstractControl): ValidationErrors | null {
    const pass = formGroup.get('contrasena')?.value;
    const repeat = formGroup.get('repetirContrasena')?.value;
    return pass === repeat ? null : { noCoinciden: true };
  }

  seleccionarImagen(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(archivo);
    } else {
      this.archivoSeleccionado = null;
      this.previewUrl = null;
    }
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    const formData = new FormData();
    const valores = this.registroForm.value;

    Object.keys(valores).forEach(key => {
      if (key !== 'repetirContrasena') {
        const valor = valores[key];
        const datoLimpio = typeof valor === 'string' ? valor.trim() : valor;
        formData.append(key, datoLimpio);
      }
    });

    if (this.archivoSeleccionado) {
      formData.append('file', this.archivoSeleccionado);
    }

    try {
      await this.authService.registrar(formData);
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.mensajeError = error.error?.message || 'Hubo un error al registrar el usuario.';
    } finally {
      this.cargando = false;
    }
  }
}