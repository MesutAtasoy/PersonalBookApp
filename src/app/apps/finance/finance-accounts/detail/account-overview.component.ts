import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import {DividerModule} from "primeng/divider";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import { SkeletonModule } from 'primeng/skeleton';
import {FinanceAccount, FinanceAccountType} from "@/apps/finance/finance.types";
import {PersonalFinanceService} from "@/apps/finance/finance.service"; // Import SkeletonModule

@Component({
    selector: 'app-account-overview',
    standalone: true,
    imports: [
        CommonModule,
        DividerModule,
        SkeletonModule, // Add SkeletonModule
        DatePipe,
        CurrencyPipe // Ensure pipes are available
    ],
    template: `
        <div class="w-full">
            <ng-container *ngIf="loading || !account; then skeleton else content"></ng-container>

            <!-- SKELETON LOADING TEMPLATE -->
            <ng-template #skeleton>
                <div class="grid w-full gap-4">
                    <!-- General Information Skeleton (3 boxes) -->
                    <div class="col-12 flex flex-wrap gap-4">
                        <p-skeleton width="30%" height="8rem"></p-skeleton>
                        <p-skeleton width="30%" height="8rem"></p-skeleton>
                        <p-skeleton width="30%" height="8rem"></p-skeleton>
                    </div>

                    <p-divider />

                    <h3 class="text-xl font-semibold mb-2"><p-skeleton width="30%"></p-skeleton></h3>
                    <p class="mb-4 text-color-secondary"><p-skeleton width="60%"></p-skeleton></p>

                    <!-- Account Details Skeleton (4 boxes) -->
                    <div class="col-12 flex flex-wrap gap-4">
                        <p-skeleton width="22%" height="6rem"></p-skeleton>
                        <p-skeleton width="22%" height="6rem"></p-skeleton>
                        <p-skeleton width="22%" height="6rem"></p-skeleton>
                        <p-skeleton width="22%" height="6rem"></p-skeleton>
                    </div>

                    <!-- Conditional Details Skeleton -->
                    <ng-container *ngIf="isCreditCard || isLoan">
                        <p-divider />
                        <h3 class="text-xl font-semibold mb-2"><p-skeleton width="35%"></p-skeleton></h3>
                        <p class="mb-4 text-color-secondary"><p-skeleton width="50%"></p-skeleton></p>

                        <!-- Credit/Loan Boxes (6 boxes) -->
                        <div class="col-12 flex flex-wrap gap-4">
                            <p-skeleton width="20%" height="6rem"></p-skeleton>
                            <p-skeleton width="20%" height="6rem"></p-skeleton>
                            <p-skeleton width="20%" height="6rem"></p-skeleton>
                            <p-skeleton width="20%" height="6rem"></p-skeleton>
                            <p-skeleton width="20%" height="6rem"></p-skeleton>
                            <p-skeleton width="20%" height="6rem"></p-skeleton>
                        </div>
                    </ng-container>

                    <p-divider />

                    <h2 class="text-2xl font-semibold mb-3"><p-skeleton width="40%"></p-skeleton></h2>
                    <p class="text-color-secondary mb-4"><p-skeleton width="70%"></p-skeleton></p>
                </div>
            </ng-template>


            <!-- ACTUAL CONTENT TEMPLATE -->
            <ng-template #content>
                <p-divider />

                <h3 class="text-xl font-semibold mb-2">General Information</h3>
                <div class="grid grid-rows-1 md:grid-rows-3 lg:grid-rows-3 gap-4">

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Current Balance</span>
                        <span class="text-3xl text-primary font-bold">{{ account?.balance | currency: account?.currencyCode?.code || 'USD' }}</span>
                    </div>

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Account Type</span>
                        <span class="text-3xl font-bold">{{accountType}}</span>
                    </div>

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Opening Date</span>
                        <span class="text-3xl font-bold">{{ account.openingDate ?? 'Not Provided' | date : 'mediumDate' }}</span>
                    </div>
                </div>

                <p-divider />

                <h3 class="text-xl font-semibold mb-2">Account Details</h3>
                <p class="mb-4 text-color-secondary">Name, holder details, and creation date for the account.</p>
                <div class="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-4 gap-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Account Holder Name</span>
                        <span class="text-2xl font-bold">{{ account?.accountHolderName || "Not provided" }}</span>
                    </div>
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Account Number</span>
                        <span class="text-2xl font-bold">{{ account?.accountNumber || "Not provided" }}</span>
                    </div>
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">IBAN</span>
                        <span class="text-2xl font-bold">{{ account?.iban || "Not provided" }}</span>
                    </div>
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Branch Name</span>
                        <span class="text-2xl font-bold">{{ account?.branchName || "Not provided" }}</span>
                    </div>
                </div>


                <ng-container *ngIf="isCreditCard">
                    <p-divider />

                    <h3 class="text-xl font-semibold mb-2">Credit Card Details</h3>
                    <p class="mb-4 text-color-secondary">Credit and Payment Schedule</p>
                    <div class="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-4">
                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Credit Limit</span>
                            <span class="text-2xl font-bold">{{ account?.creditLimit | currency: account?.currencyCode?.code || 'USD' || "Not provided" }}</span>
                        </div>
                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Current Debt</span>
                            <span class="text-2xl text-primary font-bold">{{ account?.currentDebt | currency: account?.currencyCode?.code || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Available Limit</span>
                            <span class="text-2xl font-bold">{{ account?.availableCredit | currency: account?.currencyCode?.code || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Statement Closing Date</span>
                            <span class="text-2xl font-bold">{{ account?.statementClosingDate | date : 'mediumDate' }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Minimum Payment</span>
                            <span class="text-2xl font-bold">{{ account?.minimumPayment | currency: account?.currencyCode?.code || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Payment Due Date</span>
                            <span class="text-2xl font-bold">{{ account?.paymentDueDate | date : 'mediumDate' }}</span>
                        </div>
                    </div>
                </ng-container>

                <ng-container *ngIf="isLoan">
                    <p-divider />

                    <h3 class="text-xl font-semibold mb-2">Loan Details</h3>
                    <p class="mb-4 text-color-secondary">Overview principal amount, interest rate, and installment schedule</p>

                    <div class="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-4 gap-4">
                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Loan Number</span>
                            <span class="text-2xl font-bold">{{ account?.loanNumber || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Principal Total Amount</span>
                            <span class="text-2xl text-primary font-bold">{{ account?.principalTotalAmount | currency: account?.currencyCode?.code || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Interest Amount</span>
                            <span class="text-2xl text-primary font-bold">{{ account?.interestAmount | currency: account?.currencyCode?.code || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Interest Rate %</span>
                            <span class="text-2xl font-bold">{{ account?.interestRate || "Not provided" }}%</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Installment Count</span>
                            <span class="text-2xl text-primary font-bold">{{ account?.installmentCount || "Not provided" }}</span>
                        </div>
                    </div>
                </ng-container>

                <p-divider />

                <h2 class="text-2xl font-semibold mb-3">Recent Transactions 🧾</h2>
                <p class="text-color-secondary mb-4">
                    View, search, and categorize historical transactions for this account.
                </p>
                <!-- Transaction list area would go here -->
                <div class="p-4 border-1 surface-border border-round surface-0 text-color-secondary">
                    Transaction list placeholder area.
                </div>
            </ng-template>
        </div>
  `
})
export class AccountOverviewComponent implements OnInit {
    account: any | null = null; // Corrected type
    bankId!: string;
    accountId!: string;
    loading: boolean = true; // Added loading state

    isCreditCard: boolean = false;
    isLoan: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService ,
        private messageService : MessageService
    ) { }

    ngOnInit(): void {
        var segments = this.router.url.split('/');
        this.bankId = segments[5];
        this.accountId = segments[7];

        this.loadAccountDetails();
    }

    loadAccountDetails(): void {
        this.financeService.getFinanceAccount(this.accountId)
            .subscribe({
                next: (response: any) => {
                    this.account = response.payload;
                    this.checkAccountType();
                    this.loading = false; // Set loading to false on success
                },
                error: (err: any) => {
                    console.error('Error loading bank details for ID:', this.accountId, err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bank details.' });
                    this.loading = false; // Set loading to false on error
                }
            })
    }

    checkAccountType(): void {
        // Corrected logic to use the ID property and literal string comparison
        const typeId = this.account?.type;

        this.isCreditCard = typeId === FinanceAccountType.CreditCardAccount.id;
        this.isLoan = typeId === FinanceAccountType.LoanAccount.id;
    }

    get accountType(): string {
        // Corrected logic to use AccountTypes constant and ID property
        return FinanceAccountType.All
            .find(x => x.id === this.account?.type)?.displayName || 'Unknown';
    }
}
