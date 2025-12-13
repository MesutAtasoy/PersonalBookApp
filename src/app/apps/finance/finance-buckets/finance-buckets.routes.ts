import {Routes} from "@angular/router";
import {BucketsComponent} from "@/apps/finance/finance-buckets/list";
import {FinanceAddBucketComponent} from "@/apps/finance/finance-buckets/create";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.BucketsComponent),
        data: { breadcrumb: '' }
    },
    {
        path: 'create',
        loadComponent: () => import('./create').then((c) => c.FinanceAddBucketComponent),
        data: { breadcrumb: 'Create' }
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./create').then((c) => c.FinanceAddBucketComponent),
        data: { breadcrumb: 'Edit' }
    }
] as Routes;
