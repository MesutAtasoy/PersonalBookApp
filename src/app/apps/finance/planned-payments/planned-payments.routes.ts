import {Routes} from "@angular/router";
import {PlannedPaymentsComponent} from "@/apps/finance/planned-payments/list";

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
    }
] as Routes;
