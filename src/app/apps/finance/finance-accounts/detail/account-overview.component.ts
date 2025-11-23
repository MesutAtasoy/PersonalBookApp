import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DividerModule} from "primeng/divider";
import {ActivatedRoute, Router} from "@angular/router";
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {MessageService} from "primeng/api";
import {FinanceAccountType} from "@/apps/finance/finance.types";

@Component({
    selector: 'app-account-overview',
    standalone: true,
    imports: [CommonModule, DividerModule],
    template: `
        <div class="w-full">

            <p-divider />

            <h3 class="text-xl font-semibold mb-2">General Information</h3>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Current Balance</span>
                    <span class="text-3xl text-primary font-bold">{{ account?.balance | currency: account?.currencyCode || 'USD' }}</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Account Type</span>
                    <span class="text-3xl font-bold">{{accountType}}</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Opening Date</span>
                    <span class="text-3xl font-bold">{{ account.openingDate | date : 'mediumDate' }}</span>
                </div>
            </div>

            <p-divider />

            <h3 class="text-xl font-semibold mb-2">Account Details</h3>
            <p class="mb-4 text-color-secondary">Name, holder details, and creation date for the account.</p>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Account Holder Name</span>
                    <span class="text-2xl font-bold">{{ account?.accountHolderName || "Not provided" }}</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Account Number</span>
                    <span class="text-2xl font-bold">{{ account?.accountNumber || "Not provided" }}</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">IBAN</span>
                    <span class="text-2xl font-bold">{{ account?.iban || "Not provided" }}</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Branch Name</span>
                    <span class="text-2xl font-bold">{{ account?.branchName || "Not provided" }}</span>
                </div>
            </div>


            <ng-container *ngIf="isCreditCard">
                <p-divider />

                <h3 class="text-xl font-semibold mb-2">Credit Card Details</h3>
                <p class="mb-4 text-color-secondary">Credit and Payment Schedule</p>
                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Credit Limit</span>
                        <span class="text-2xl font-bold">{{ account?.creditLimit | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                    </div>
                </div>
                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Current Debt</span>
                        <span class="text-2xl text-primary font-bold">{{ account?.currentDebt | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Available Limit</span>
                        <span class="text-2xl font-bold">{{ account?.availableCredit | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Statement Closing Date</span>
                        <span class="text-2xl font-bold">{{ account?.statementClosingDate | date : 'mediumDate' }}</span>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Minimum Payment</span>
                        <span class="text-2xl font-bold">{{ account?.minimumPayment | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                    </div>
                </div>

                <div class="col-12 md:col-4">
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

                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Loan Number</span>
                        <span class="text-2xl font-bold">{{ account?.loanNumber || "Not provided" }}</span>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Principal Total Amount</span>
                        <span class="text-2xl text-primary font-bold">{{ account?.principalTotalAmount | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                    </div>

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Interest Amount</span>
                        <span class="text-2xl text-primary font-bold">{{ account?.interestAmount | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                    </div>

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Interest Rate %</span>
                        <span class="text-2xl font-bold">{{ account?.interestRate || "Not provided" }}</span>
                    </div>

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Installment Count</span>
                        <span class="text-2xl text-primary font-bold">{{ account?.installmentCount || "Not provided" }}</span>
                    </div>
                </div>

            </ng-container>


        </div>

        <p-divider />

        <h2 class="text-2xl font-semibold mb-3">Recent Transactions 🧾</h2>
        <p class="text-color-secondary mb-4">
            View, search, and categorize historical transactions for this account.
        </p>
  `
})
export class AccountOverviewComponent implements OnInit {
    account: any | null = null;
    bankId!: string;
    accountId!: string;

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
                },
                error: (err: any) => {
                    console.error('Error loading bank details for ID:', this.accountId, err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bank details.' });
                }
            })
    }

    checkAccountType(): void {
        const typeId = this.account?.type;

        // Assuming FinanceAccountType is defined and imported
        this.isCreditCard = typeId === FinanceAccountType.CreditCardAccount.id;
        this.isLoan = typeId === FinanceAccountType.LoanAccount.id;
    }

    get accountType(){
        return FinanceAccountType.All
            .find(x=>x.id ==  this.account?.type)?.displayName;
    }
}
