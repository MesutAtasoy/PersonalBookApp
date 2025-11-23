import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, Params } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import {MenuItem, MessageService} from 'primeng/api';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import {PersonalFinanceService} from "@/apps/finance/finance.service";

// Assuming you have a component that acts as a loading placeholder or breadcrumb
// import { BreadcrumbComponent } from '@/shared/components/breadcrumb/breadcrumb.component';

// --- Interface for Account (Simplified) ---
interface AccountDetail {
    id: number;
    name: string;
    type: string;
    bankName: string;
}
// ------------------------------------------

@Component({
    selector: 'app-account-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MenuModule,
        CardModule,
        SkeletonModule,
        // BreadcrumbComponent
    ],
    providers: [ MessageService ],
    template: `
    <div class="p-4">
        <div class="mb-4">
            <h1 class="text-3xl font-bold mb-1">
                {{ account?.name || 'Loading Account...' }}
            </h1>
            <p class="text-color-secondary">
                {{ account?.type || '...' }} Account at {{ account?.bankName || '...' }}
            </p>
        </div>

        <div class="grid">
            <div class="col-12 md:col-3">
                <p-menu [model]="menuItems" class="w-full"></p-menu>
            </div>

            <div class="col-12 md:col-9">
                <p-card>
                    <router-outlet></router-outlet>
                </p-card>
            </div>
        </div>
    </div>
    `
})
export class AccountDetailComponent implements OnInit {
    bankId!: string;
    accountId!: string;
    account: AccountDetail | null = null;
    menuItems: MenuItem[] = [];
    isLoading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService ,
        private messageService : MessageService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe((params: Params) => {
            this.bankId = params['bankId'];
            this.accountId = params['accountId']; // Convert to number

            // Re-initialize when params change (though usually not necessary for bank detail)
            this.loadAccountDetails();
            this.buildMenu();
        });
    }

    loadAccountDetails(): void {
        this.isLoading = true;

        // --- Replace with actual service call ---
        // this.financeService.getAccountDetail(this.accountId).subscribe(data => { ... });

        this.financeService.getFinanceAccount(this.accountId)
            .subscribe({
                next: (response: any) => {
                    this.account = response.payload;
                    this.isLoading = false;
                },
                error: (err: any) => {
                    console.error('Error loading bank details for ID:', this.accountId, err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bank details.' });
                    this.isLoading = false;
                }
            })

    }

    buildMenu(): void {
        // Base URL for routing (e.g., /banks/1/accounts/101/)
        const baseUrl = `apps/finance/finance-banks/${this.bankId}/accounts/${this.accountId}`;

        this.menuItems = [
            { label: 'Overview', icon: 'pi pi-chart-pie', routerLink: [`${baseUrl}/overview`], routerLinkActiveOptions: { exact: true } },
            { label: 'Transactions', icon: 'pi pi-list', routerLink: [`${baseUrl}/transactions`] },
            { separator: true },
            { label: 'Cards', icon: 'pi pi-credit-card', routerLink: [`${baseUrl}/cards`] },
            { label: 'Buckets', icon: 'pi pi-wallet', routerLink: [`${baseUrl}/buckets`] },
            { label: 'Installment Plans', icon: 'pi pi-calendar', routerLink: [`${baseUrl}/installments`] },
            { separator: true },
            { label: 'Settings', icon: 'pi pi-cog', routerLink: [`${baseUrl}/settings`] }
        ];

        // Redirect to the default 'overview' page if navigating to the base URL
        if (this.router.url === baseUrl) {
            this.router.navigate([`${baseUrl}/overview`]);
        }
    }
}
