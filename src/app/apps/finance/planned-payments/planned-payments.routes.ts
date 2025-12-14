import {Routes} from "@angular/router";
import {PlannedPaymentOverviewComponent} from "@/apps/finance/planned-payments/overview";
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
        data: { breadcrumb: 'Detail' }
    },
    {
        path: 'overview',
        loadComponent: () => import('./overview').then((c) => c.PlannedPaymentOverviewComponent),
        data: { breadcrumb: 'Overview' }
    }
] as Routes;
