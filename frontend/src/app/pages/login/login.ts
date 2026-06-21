import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  cargando = false;
  mensajeError = '';

  constructor() {
    this.loginForm = this.fb.group({
      loginInput: ['', [Validators.required]], 
      contrasena: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    try {
      const usuarioLogueado = await this.authService.login(this.loginForm.value);
      
      if (usuarioLogueado) {
        this.router.navigate(['/publicaciones']); 
      }
    } catch (error: any) {
      this.mensajeError = error.error?.message || 'Credenciales de acceso incorrectas.';
    } finally {
      this.cargando = false;
    }
  }
}