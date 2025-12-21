import {Routes} from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.AcademyListComponent),
        data: { breadcrumb: '' }
    },
    {
        path: 'categories',
        loadComponent: () => import('./categories').then((c) => c.AcademyCategoriesComponent),
        data: { breadcrumb: '' }
    },
    {
        path: 'courses/:id',
        loadComponent: () => import('./detail').then((c) => c.AcademyDetailsComponent),
        data: { breadcrumb: '' }
    },
] as Routes;
