import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 1. Buscamos si el token ya está en el LocalStorage
  const tokenInStorage = localStorage.getItem('access_token');

  // 2. Buscamos si el token viene en los parámetros de la URL (Redirección de Google)
  const tokenInUrl = route.queryParamMap.get('token');

  if (tokenInUrl) {
    // Persistimos el token de raíz para que el interceptor lo inyecte en todas las llamadas HTTP
    localStorage.setItem('access_token', tokenInUrl);

    // Decodificamos el payload para guardar el ID de usuario de forma síncrona en LocalStorage
    try {
      const tokenPayload = JSON.parse(atob(tokenInUrl.split('.')[1]));
      if (tokenPayload && tokenPayload.sub) {
        localStorage.setItem('user_id', tokenPayload.sub.toString());
      }
    } catch (e) {
      console.error('Error decodificando la estampa del token JWT:', e);
    }

    // CORRECCIÓN SÓLIDA: Limpiamos los query params navegando a la URL actual pura (state.url sin parámetros)
    const urlSinParams = state.url.split('?')[0];
    router.navigate([urlSinParams], {
      queryParams: { token: null },
      queryParamsHandling: 'merge', // Quita el token de la barra de direcciones de forma limpia
    });
    return true;
  }

  if (tokenInStorage) {
    // Si ya existe en almacenamiento local, nos aseguramos de que el user_id esté calculado
    if (!localStorage.getItem('user_id')) {
      try {
        const tokenPayload = JSON.parse(atob(tokenInStorage.split('.')[1]));
        if (tokenPayload && tokenPayload.sub) {
          localStorage.setItem('user_id', tokenPayload.sub.toString());
        }
      } catch (e) {
        console.error('Error al configurar identificador latente:', e);
      }
    }
    return true;
  }

  // Si no hay credenciales por ningún canal, rebota al login de bienvenida
  router.navigate(['/welcome']);
  return false;
};
