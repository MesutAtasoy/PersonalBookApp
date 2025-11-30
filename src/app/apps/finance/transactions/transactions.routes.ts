import {Routes} from "@angular/router";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.TransactionsComponent),
        data: { breadcrumb: '' }
    }
] as Routes;
