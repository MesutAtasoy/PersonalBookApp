import {Routes} from "@angular/router";
import {PlannedPaymentsComponent} from "@/apps/finance/planned-payments/list";
import {FinanceCurrenciesComponent} from "@/apps/finance/settings/currencies/list";
import {FinanceCategoriesComponent} from "@/apps/finance/settings/categories/list";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.FinanceCategoriesComponent),
        data: { breadcrumb: 'Banks' }
    }
] as Routes;
