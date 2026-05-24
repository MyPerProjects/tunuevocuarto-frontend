import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user';
import { UserProfile } from '../../models/user.model';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDivider,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  profileForm: FormGroup;
  loading = false;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],

      // Yape: Campo obligatorio, inicia con 9 y tiene 9 dígitos exactamente
      yapeNumber: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],

      // BCP: Opcional, pero si se escribe algo debe cumplir con los 14 dígitos numéricos
      bcpAccount: ['', [Validators.pattern(/^\d{14}$/)]],
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue(user);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil real de la base de datos:', err);
        this.snackBar.open('No se pudo cargar la información del perfil', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }

  saveChanges() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.cdr.detectChanges();

      this.userService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al guardar mutaciones del perfil:', err);
          this.snackBar.open('Error al actualizar los datos bancarios', 'Cerrar', {
            duration: 3000,
          });
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    this.router.navigate(['/welcome']);
  }
}
