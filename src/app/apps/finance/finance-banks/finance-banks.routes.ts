import { Routes } from '@angular/router';
import {FinanceBankDetailComponent} from "@/apps/finance/finance-banks/detail/detail";
import {BankOverviewComponent} from "@/apps/finance/finance-banks/detail/overview";
import {BankAccountsComponent} from "@/apps/finance/finance-banks/detail/accounts";
import {BankTransactionsComponent} from "@/apps/finance/finance-banks/detail/transactions";
import {BankSettingsComponent} from "@/apps/finance/finance-banks/detail/settings";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.FinanceBankListComponent),
        data: { breadcrumb: '' }
    },
    {
        path: ':id/detail',
        component: FinanceBankDetailComponent, // PARENT ROUTE
        children: [
            // Redirect to overview as the default child route
            { path: '', redirectTo: 'overview', pathMatch: 'full' },

            // CHILD ROUTES
            { path: 'overview', component: BankOverviewComponent },
            { path: 'accounts', component: BankAccountsComponent },
            { path: 'transactions', component: BankTransactionsComponent },
            { path: 'settings', component: BankSettingsComponent },
        ]
    }
] as Routes;
