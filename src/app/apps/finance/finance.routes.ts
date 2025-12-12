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
    },
    {
        path: 'planned-payments',
        loadChildren: () => import('./planned-payments/planned-payments.routes'),
        data: { breadcrumb: 'Planned Payments' }
    },
    {
        path: 'buckets',
        loadChildren: () => import('./finance-buckets/finance-buckets.routes'),
        data: { breadcrumb: 'Bucket' }
    },
    {
        path: 'settings',
        loadChildren: () => import('./settings/settings.routes'),
        data: { breadcrumb: 'Settings' }
    }
] as Routes;
