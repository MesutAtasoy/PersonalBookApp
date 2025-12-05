import {Routes} from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.TransactionsComponent),
        data: { breadcrumb: '' }
    },
    {
        path: 'create',
        loadComponent: () => import('./create').then((c) => c.TransactionCreateComponent),
        data: { breadcrumb: 'Create' }
    }
] as Routes;
