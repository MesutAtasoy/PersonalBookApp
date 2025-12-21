import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DividerModule } from "primeng/divider";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
// **(1) New: Import Chart Module** - Assuming a PrimeNG or Chart.js based module
import { ChartModule } from 'primeng/chart';

import {
    CategoryStat,
    DateTimeRangeType,
    DateTimeRangeTypeDto,
    FinanceAccount,
    FinanceAccountType, FinanceTransaction, FinanceTransactionType, FinanceTransactionTypeDto, StatItem
} from "@/apps/finance/finance.types";
import { PersonalFinanceService } from "@/apps/finance/finance.service";
import moment from "moment";
import {DatePickerModule} from "primeng/datepicker";
import {Toast} from "primeng/toast";
import {ChartData} from "chart.js";
import {Dialog} from "primeng/dialog";
import {TableModule} from "primeng/table";
import {Tag} from "primeng/tag";

interface CategoryStatItem {
    type: number;
    totalValue: number;
    items: StatItem[];
    chatData: any
}

interface Payment {
    name: string;
    amount: number;
    paid: boolean;
    date: string;
}

@Component({
    selector: 'app-account-overview',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        DividerModule,
        SkeletonModule,
        FormsModule,
        SelectModule,
        DatePickerModule,
        ButtonModule,
        ChartModule, // **(2) Added ChartModule**
        DatePipe,
        CurrencyPipe,
        Toast,
        Dialog,
        TableModule,
        Tag
    ],
    template: `
        <div class="w-full">
            <p-toast></p-toast>

            <ng-container *ngIf="loading || !account; then skeleton else content"></ng-container>

            <ng-template #skeleton>
                <div class="p-4 mb-4 surface-section border-round shadow-1">
                    <div class="flex justify-content-between align-items-center mb-3">
                        <p-skeleton width="30%" height="1.5rem"></p-skeleton>
                        <p-skeleton width="10%" height="2.5rem"></p-skeleton>
                    </div>
                    <div class="flex gap-3">
                        <p-skeleton width="20%" height="2.5rem"></p-skeleton>
                        <p-skeleton width="25%" height="2.5rem"></p-skeleton>
                        <p-skeleton width="25%" height="2.5rem"></p-skeleton>
                        <p-skeleton width="15%" height="2.5rem"></p-skeleton>
                    </div>
                </div>
                <div class="grid w-full gap-4">
                    <div class="col-12 flex flex-wrap gap-4">
                        <p-skeleton width="30%" height="10rem"></p-skeleton>
                        <p-skeleton width="30%" height="10rem"></p-skeleton>
                        <p-skeleton width="30%" height="10rem"></p-skeleton>
                    </div>
                    <p-divider />
                    <div class="col-12 flex flex-wrap gap-4">
                        <p-skeleton width="30%" height="8rem"></p-skeleton>
                        <p-skeleton width="30%" height="8rem"></p-skeleton>
                        <p-skeleton width="30%" height="8rem"></p-skeleton>
                    </div>
                    <p-divider />
                </div>
            </ng-template>


            <ng-template #content>

                <h3 class="text-xl font-semibold mb-2">General Information</h3>
                <div class="grid grid-rows-1 md:grid-rows-3 lg:grid-rows-3 gap-4">

                    <div class="p-3 surface-200 border-round">
                        <span class="text-xl font-medium block">Current Balance</span>
                        <span class="text-3xl text-primary font-bold">{{ account?.balance | currency: account?.currencyCode || 'USD' }}</span>
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
                            <span class="text-2xl font-bold">{{ account?.creditLimit | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                        </div>
                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Current Debt</span>
                            <span class="text-2xl text-primary font-bold">{{ account?.currentDebt | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Available Limit</span>
                            <span class="text-2xl font-bold">{{ account?.availableCredit | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Statement Closing Date</span>
                            <span class="text-2xl font-bold">{{ account?.statementClosingDate | date : 'mediumDate' }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Minimum Payment</span>
                            <span class="text-2xl font-bold">{{ account?.minimumPayment | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
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
                            <span class="text-2xl text-primary font-bold">{{ account?.principalTotalAmount | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
                        </div>

                        <div class="p-3 surface-200 border-round">
                            <span class="text-xl font-medium block">Interest Amount</span>
                            <span class="text-2xl text-primary font-bold">{{ account?.interestAmount | currency: account?.currencyCode || 'USD' || "Not provided" }}</span>
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

                <div class="p-4 mb-6 surface-section border-round shadow-1">
                    <div class="flex justify-between align-items-center mb-3">
                        <div class="text-xl font-semibold">Summary  {{ dateSummaryText }}</div>
                        <p-button
                            label="Filter"
                            icon="pi pi-filter"
                            (onClick)="showFilterDialog = true">
                        </p-button>
                    </div>

                    <div class="row">
                        <div class="col-4 mt-4" *ngFor="let categoriesChartData of categoriesChartDataList">
                            <div class="p-3 surface-200 border-round h-full">
                                <h3 class="text-lg font-medium mb-2">{{ getTransactionType(categoriesChartData.type) }}</h3>
                                <div class="flex items-center">
                                    <div class="chart-container w-1/3 p-2" *ngIf="categoriesChartData.chatData">
                                        <p-chart type="doughnut" [data]="categoriesChartData.chatData" [options]="chartOptions"></p-chart>
                                    </div>
                                    <div class="details w-2/3 pl-4">
                                        <div *ngFor="let item of categoriesChartData.items" class="flex justify-content-between mb-1">
                                            <span class="truncate mr-4" [style.color]="item.color">{{ item.label }}</span>
                                            <span class="font-bold">{{ item.value | currency: account?.currencyCode || 'USD' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p-dialog
                    header="Filter"
                    [(visible)]="showFilterDialog"
                    [modal]="true"
                    [style]="{width: '300px'}"
                    (onHide)="resetFilterDialog()">

                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Filter</label>
                        <p-select
                            [options]="dateTimeRangeOptions"
                            [(ngModel)]="tempFilter.filter"
                            optionLabel="displayName"
                            optionValue="id"
                            (onChange)="onFilterTypeChange()"
                            placeholder="Select Time Range"
                            name="timeRangeFilter"
                            appendTo = "body"
                            styleClass="w-full">
                        </p-select>
                    </div>

                    <ng-container *ngIf="tempFilter.filter === 9">
                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Choose a start date</label>
                            <p-date-picker
                                [(ngModel)]="tempFilter.startDate"
                                [showIcon]="true"
                                dateFormat="dd M yy"
                                name="startDate"
                                appendTo = "body">
                            </p-date-picker>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Choose a end date</label>
                            <p-date-picker
                                [(ngModel)]="tempFilter.endDate"
                                [showIcon]="true"
                                dateFormat="dd M yy"
                                name="endDate"
                                appendTo = "body">
                            </p-date-picker>
                        </div>
                    </ng-container>

                    <ng-template pTemplate="footer">
                        <p-button
                            label="Close"
                            icon="pi pi-times"
                            styleClass="p-button-text p-button-sm"
                            (onClick)="showFilterDialog = false">
                        </p-button>
                        <p-button
                            label="Reset"
                            icon="pi pi-refresh"
                            styleClass="p-button-secondary p-button-text p-button-sm"
                            (onClick)="resetFilter()">
                        </p-button>
                        <p-button
                            label="Apply"
                            icon="pi pi-check"
                            styleClass="p-button-sm"
                            (onClick)="applyFilter()">
                        </p-button>
                    </ng-template>
                </p-dialog>

                <p-divider/>

                <h2 class="text-2xl font-semibold mb-3">Recent Transactions 🧾</h2>
                <p class="text-color-secondary mb-4">
                    View, search, and categorize historical transactions for this account.
                </p>
                <div class="">
                    <div
                        class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4"
                    >

                    </div>

                    <p-table [value]="transactions" [rows]="5" dataKey="id">
                        <ng-template #header>
                            <tr>
                                <th>Number</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Transaction Date</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-transaction>
                            <tr>
                                <td>{{ transaction.number}}</td>
                                <td>
                                    {{ transaction.transactionAmount.amount | currency: transaction.transactionAmount.currencyCode }}
                                </td>
                                <td>
                                    <p-tag
                                        [value]="getTransactionType(transaction.type)?.displayName || 'Unknown'"
                                        [icon]="'pi pi-' + getTransactionType(transaction.type)?.icon">
                                    </p-tag>
                                </td>
                                <td>
                                    {{ transaction.transactionDate | date: 'medium' }}
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </ng-template>
        </div>
    `
})
export class AccountOverviewComponent implements OnInit {
    account: any | null = null;
    bankId!: string;
    accountId!: string;
    loading: boolean = true;
    isCreditCard: boolean = false;
    isLoan: boolean = false;

    // --- Filter State ---
    showFilterDialog: boolean = false;
    dateTimeRangeOptions: DateTimeRangeTypeDto[] = DateTimeRangeType.All;

    filterParameters = {
        filter: DateTimeRangeType.All[3].id, // Default to Last 12 Month
        startDate: null as Date | null,
        endDate: null as Date | null,
    };

    tempFilter: { filter: number, startDate: Date | null, endDate: Date | null } = { ...this.filterParameters };

    // --- Stats & Chart Data ---
    categoryStat: CategoryStat | null = null;
    chartOptions: any = { // **New: Doughnut chart options**
        responsive: true,
        plugins: {
            legend: {
                display: false, // Hide legend since we display list next to chart
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem: any) {
                        let label = tooltipItem.label || '';
                        if (label) {
                            label += ': ';
                        }
                        // Format the value as currency using the user's setup if available
                        label += tooltipItem.formattedValue;
                        return label;
                    }
                }
            }
        },
        cutout: '60%' // Makes it a doughnut chart
    };


    categoriesChartDataList : CategoryStatItem[] = [];

    transactions!: FinanceTransaction[];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService,
        private messageService: MessageService,
        private changeDetectorRef: ChangeDetectorRef
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
                    this.loading = false;
                    this.loadStats();
                    this.loadTransactions();
                },
                error: (err: any) => {
                    console.error('Error loading bank details for ID:', this.accountId, err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bank details.' });
                    this.loading = false;
                }
            })
    }

    loadStats(): void {
        if (!this.account) return;

        const request = {
            accountId: this.account.id,
            dateTimeRangeFilter: {
                type: this.filterParameters.filter,
                startDate: this.filterParameters.filter === 9 && this.filterParameters.startDate? moment(this.filterParameters.startDate).format('YYYY-MM-DD') : undefined,
                endDate: this.filterParameters.filter === 9 && this.filterParameters.endDate ? moment(this.filterParameters.endDate).format('YYYY-MM-DD') : undefined,
            }
        };

        this.financeService.categoryStats(request)
            .subscribe((res: any) => {
                this.categoryStat = res.payload;
                this._prepareChartData(); // **(3) Call to prepare chart data**
                this.changeDetectorRef.detectChanges();
            })
    }

    /**
     * Transforms the raw categoryStat data into ChartData structure (labels, datasets).
     */
    private _prepareChartData(): void {

        if (!this.categoryStat) {
            this.categoriesChartDataList = []
            return;
        }



        // Helper function to process an array of StatItems
        const processStats = (stats: StatItem[]): ChartData | null => {
            if (!stats || stats.length === 0) {
                return null;
            }

            const labels = stats.map(s => s.label);
            const data = stats.map(s => s.value ?? 0);
            const backgroundColors = stats.map(s => s.color);

            return {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverBackgroundColor: backgroundColors, // Use same for hover
                }]
            };
        };

        this.categoryStat.statItems.forEach(statItem=> {
            var chatData = processStats(statItem.items)
            this.categoriesChartDataList.push({
                chatData: chatData,
                type: statItem.type,
                totalValue: statItem.totalValue,
                items: statItem.items
            })
        })
    }

    // --- Filter Logic (Unchanged) ---

    onFilterTypeChange(): void {
        if (this.tempFilter.filter !== 9) {
            this.tempFilter.startDate = null;
            this.tempFilter.endDate = null;
        }
    }

    applyFilter(): void {

        this.categoriesChartDataList = [];
        if (this.tempFilter.filter === 9) {
            if (!this.tempFilter.startDate || !this.tempFilter.endDate) {
                this.messageService.add({ severity: 'warn', summary: 'Filter', detail: 'Start and end dates are required for Range filter.' });
                return;
            }
            if (this.tempFilter.startDate > this.tempFilter.endDate) {
                this.messageService.add({ severity: 'warn', summary: 'Filter', detail: 'Start date cannot be after end date.' });
                return;
            }
        }

        this.filterParameters.filter = this.tempFilter.filter;
        this.filterParameters.startDate = this.tempFilter.startDate;
        this.filterParameters.endDate = this.tempFilter.endDate;

        this.showFilterDialog = false;
        this.loadStats();
    }

    resetFilter(): void {
        const defaultFilterCode = DateTimeRangeType.All[3].id;
        this.tempFilter.filter = defaultFilterCode;
        this.tempFilter.startDate = null;
        this.tempFilter.endDate = null;

        this.filterParameters.filter = defaultFilterCode;
        this.filterParameters.startDate = null;
        this.filterParameters.endDate = null;

        this.showFilterDialog = false;
        this.loadStats();
    }

    resetFilterDialog(): void {
        this.tempFilter = { ...this.filterParameters };
    }

    // --- Helper Getters (Unchanged) ---

    get dateSummaryText(): string {
        const currentFilter = this.dateTimeRangeOptions.find(o => o.id === this.filterParameters.filter);

        if (this.filterParameters.filter === 9 && this.filterParameters.startDate && this.filterParameters.endDate) {
            const start = moment(this.filterParameters.startDate).format('DD MMM YYYY');
            const end = moment(this.filterParameters.endDate).format('DD MMM YYYY');
            return `${start} - ${end}`;
        }

        if (currentFilter) {
            return currentFilter.displayName;
        }

        return 'Date Range Filter';
    }

    checkAccountType(): void {
        const typeId = this.account?.type;
        this.isCreditCard = typeId === FinanceAccountType.CreditCardAccount.id;
        this.isLoan = typeId === FinanceAccountType.LoanAccount.id;
    }

    get accountType(): string {
        return FinanceAccountType.All
            .find(x => x.id === this.account?.type)?.displayName || 'Unknown';
    }

    loadTransactions(sortField: string = '', sortOrder: number = 1): void {

        const filter =   {
            query:  "",
            pageNumber: 1,
            pageSize: 5,
            filters: [
                {
                    "field": "AccountBased",
                    "operator": "equal",
                    "value": this.accountId
                }
            ],
            sorts: []
        };

        this.financeService.searchTransactionsV2(filter).subscribe({
            next: (response: any) => {
                this.transactions = response.payload.data;
                this.changeDetectorRef.detectChanges();


            },
            error: (err: any) => {
                console.error('Error loading transactions:', err);
                this.transactions = [];
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    getTransactionType(typeId: number | undefined): FinanceTransactionTypeDto | undefined {
        if (typeId === undefined) return undefined;
        return FinanceTransactionType.All.find(t => t.id === typeId);
    }


}
