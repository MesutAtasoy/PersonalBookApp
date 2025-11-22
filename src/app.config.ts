import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation, withInMemoryScrolling, withEnabledBlockingInitialNavigation } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@/core/auth/auth.interceptor';
import { AuthService } from '@/core/auth/auth.service';
import {MessageService} from "primeng/api";

export const appConfig: ApplicationConfig = {
    providers: [
        // Router configuration
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation(),
            withHashLocation()
        ),

        // HTTP Client with interceptors
        provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor])
        ),

        // Animations
        provideAnimations(),

        // PrimeNG configuration
        providePrimeNG({
            theme: {
                preset: Aura,
                options: { darkModeSelector: '.app-dark' }
            }
        }),

        // Auth services
        AuthService
    ]
};
