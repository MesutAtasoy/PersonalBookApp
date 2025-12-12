import {Routes} from "@angular/router";
import {BucketsComponent} from "@/apps/finance/finance-buckets/list";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.BucketsComponent),
        data: { breadcrumb: '' }
    },
    // {
    //     path: 'create',
    //     loadComponent: () => import('./create').then((c) => c.TransactionCreateComponent),
    //     data: { breadcrumb: 'Create' }
    // }
] as Routes;
