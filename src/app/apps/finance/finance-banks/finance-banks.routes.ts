import { Routes } from '@angular/router';
import {FinanceBankDetailComponent} from "@/apps/finance/finance-banks/detail/detail";
import {BankOverviewComponent} from "@/apps/finance/finance-banks/detail/overview";
import {BankAccountsComponent} from "@/apps/finance/finance-banks/detail/accounts";
import {BankTransactionsComponent} from "@/apps/finance/finance-banks/detail/transactions";
import {BankSettingsComponent} from "@/apps/finance/finance-banks/detail/settings";
import {AccountCreateComponent} from "@/apps/finance/finance-banks/detail/create-account";
import {AccountDetailComponent} from "@/apps/finance/finance-accounts/detail/account-detail.component";
import {AccountOverviewComponent} from "@/apps/finance/finance-accounts/detail/account-overview.component";
import {AccountSettingsComponent} from "@/apps/finance/finance-accounts/detail/account-settings.component";
import {AccountCardsComponent} from "@/apps/finance/finance-accounts/detail/account-cards.component";
import {AccountBucketsComponent} from "@/apps/finance/finance-accounts/detail/account-buckets.component";
import {AccountTransactionsComponent} from "@/apps/finance/finance-accounts/detail/account-transactions.component";
import {
    AccountInstallmentPlansComponent
} from "@/apps/finance/finance-accounts/detail/account-installment-plans.component";

export default [
    {
        path: '',
        loadComponent: () => import('./list').then((c) => c.FinanceBankListComponent),
        data: { breadcrumb: '' }
    },
    {
        path: ':id/detail',
        component: FinanceBankDetailComponent,
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: BankOverviewComponent },
            { path: 'transactions', component: BankTransactionsComponent },
            { path: 'settings', component: BankSettingsComponent },
            { path: 'accounts', component: BankAccountsComponent },
            { path: 'accounts/create', component: AccountCreateComponent },
        ]
    },
    {
        path: 'banks/:bankId/accounts/:accountId',
        component: AccountDetailComponent,
        children: [
            { path: '', redirectTo: 'overview', pathMatch: 'full' },
            { path: 'overview', component: AccountOverviewComponent },
            { path: 'settings', component: AccountSettingsComponent },
            { path: 'cards', component: AccountCardsComponent },
            { path: 'buckets', component: AccountBucketsComponent },
            { path: 'transactions', component: AccountTransactionsComponent },
            { path: 'installments', component: AccountInstallmentPlansComponent },
        ]
    },
] as Routes;
