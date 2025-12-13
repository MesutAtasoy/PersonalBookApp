import {Routes} from "@angular/router";
export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.PlannedPaymentsComponent),
        data: { breadcrumb: '' }
    },
    {
        path: 'create',
        loadComponent: () => import('./create').then((c) => c.CreateInstallmentPlanComponent),
        data: { breadcrumb: 'Create' }
    },
    {
        path: ':id/details',
        loadComponent: () => import('./detail').then((c) => c.InstallmentPlanManagementComponent),
        data: { breadcrumb: 'Create' }
    }
] as Routes;
