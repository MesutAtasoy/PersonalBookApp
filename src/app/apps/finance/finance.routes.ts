import {Routes} from "@angular/router";

export default [
    {
        path: 'finance-banks',
        loadChildren: () => import('./finance-banks/finance-banks.routes'),
        data: { breadcrumb: 'Finance Banks' }
    },
    {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.routes'),
        data: { breadcrumb: 'Transactions' }
    }
] as Routes;
