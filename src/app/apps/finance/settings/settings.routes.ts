import {Routes} from "@angular/router";
import {PlannedPaymentsComponent} from "@/apps/finance/planned-payments/list";

export default [
    {
        path: 'currencies',
        loadChildren: () => import('./currencies/currencies.routes'),
        data: { breadcrumb: 'Currencies' }
    },
    {
        path: 'banks',
        loadChildren: () => import('./banks/banks.routes'),
        data: { breadcrumb: 'Banks' }
    },
    {
        path: 'categories',
        loadChildren: () => import('./categories/categories.routes'),
        data: { breadcrumb: 'Categories' }
    },
] as Routes;
