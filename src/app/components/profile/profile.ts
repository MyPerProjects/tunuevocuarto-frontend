import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user';
import { UserProfile } from '../../models/user.model';
import { Router } from '@angular/router';

// Material
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

  profileForm: FormGroup;
  loading = false;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      yapeNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      bcpAccount: [''],
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue(user);
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
      this.userService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al guardar mutaciones del perfil:', err);
          this.snackBar.open('Error al actualizar los datos bancarios', 'Cerrar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    }
  }

  logout() {
    // Purgamos de raíz todas las llaves de sesión multipropietario para evitar rastros remanentes
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');

    // Redirección inmediata a la pantalla de bienvenida
    this.router.navigate(['/welcome']);
  }
}
