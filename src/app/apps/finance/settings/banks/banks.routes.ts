import {Routes} from "@angular/router";
import {PlannedPaymentsComponent} from "@/apps/finance/planned-payments/list";
import {FinanceCurrenciesComponent} from "@/apps/finance/settings/currencies/list";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.FinanceBanksComponent),
        data: { breadcrumb: 'Banks' }
    }
] as Routes;
