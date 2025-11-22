import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; // Include CurrencyPipe and DatePipe
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PersonalFinanceService } from '@/apps/finance/finance.service'; // Adjust path as necessary
import {
    FinanceTransaction,
    FinanceTransactionSearchFilter, // The correct filter interface
    FinanceTransactionType, // Class for transaction types
    FinanceTransactionTypeDto,
    Money,
    FinanceCategoryRef
} from '@/apps/finance/finance.types'; // Use the provided interfaces

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import {SelectModule} from "primeng/select";


// Define the structure for transaction columns
interface Column {
    field: keyof FinanceTransaction | 'displayAmount'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}

@Component({
    selector: 'app-bank-transactions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        PaginatorModule,
        InputTextModule,
        ButtonModule,
        TagModule,
        SkeletonModule,
        MultiSelectModule,
        SelectModule
    ],
    // Add pipes to providers if using them directly in the component class (not template)
    // Here we use them in the template via Angular's built-in pipes and custom logic.
    template: `
        <div class="p-4">
            <h3 class="text-xl font-semibold mb-4">Transaction History</h3>

            <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">

                <div class="p-inputgroup w-full md:w-30rem">
                    <input
                        type="text"
                        pInputText
                        placeholder="Search Transactions..."
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onSearchChange()">
                    <button type="button" pButton icon="pi pi-search" (click)="loadTransactions()"></button>
                </div>
                <div class="flex items-center gap-2">
                    <i class="pi pi-cog text-xl text-700 hidden md:block" title="Customize Columns"></i>

                    <p-multiSelect
                        [options]="allColumns"
                        [(ngModel)]="selectedColumns"
                        optionLabel="header"
                        display="chip"
                        placeholder="Select Columns"
                        styleClass="w-full md:w-20rem">
                    </p-multiSelect>
                </div>
            </div>

            <p-table
                [value]="loading ? skeletonData : transactions"
                [scrollable]="true"
                scrollHeight="400px"
                [paginator]="true"
                [rows]="rows"
                [totalRecords]="totalRecords"
                [lazy]="true"
                (onLazyLoad)="onLazyLoad($event)">

                <ng-template pTemplate="header">
                    <tr>
                        <th *ngFor="let col of selectedColumns" [pSortableColumn]="col.field">
                            {{ col.header }}
                            <p-sortIcon [field]="col.field"></p-sortIcon>
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-transaction>
                    <tr *ngIf="loading">
                        <td *ngFor="let col of selectedColumns">
                            <p-skeleton></p-skeleton>
                        </td>
                    </tr>
                    <tr *ngIf="!loading">
                        <td *ngFor="let col of selectedColumns">
                            <ng-container [ngSwitch]="col.field">

                                <span *ngSwitchCase="'transactionAmount'" [ngClass]="{'text-red-500': transaction.transactionAmount.amount < 0, 'text-green-500': transaction.transactionAmount.amount >= 0}">
                                    {{ transaction.transactionAmount.amount | currency: transaction.transactionAmount.currencyCode }}
                                </span>

                                <p-tag
                                    *ngSwitchCase="'category'"
                                    [value]="transaction.category?.name || 'N/A'">
                                </p-tag>

                                <p-tag
                                    *ngSwitchCase="'type'"
                                    [value]="getTransactionType(transaction.type)?.displayName || 'Unknown'"
                                    [icon]="'pi pi-' + getTransactionType(transaction.type)?.icon">
                                </p-tag>

                                <span *ngSwitchCase="'transactionDate'">
                                    {{ transaction.transactionDate | date: 'medium' }}
                                </span>

                                <span *ngSwitchCase="'fromAccount'">
                                    {{ transaction.fromAccount?.name  }}
                                </span>

                                <span *ngSwitchCase="'toAccount'">
                                    {{ transaction.toAccount?.name  }}
                                </span>

                                <span *ngSwitchDefault>{{ transaction[col.field] }}</span>
                            </ng-container>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td [attr.colspan]="selectedColumns.length" class="text-center p-4">
                            No transactions found for the current criteria.
                        </td>
                    </tr>
                </ng-template>

            </p-table>
        </div>
    `,
    styles: [`
        :host { display: block; }
        .p-datatable-wrapper {
            border: 1px solid var(--surface-border);
            border-radius: var(--border-radius);
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankTransactionsComponent implements OnInit {
    bankId!: string;
    transactions: FinanceTransaction[] = [];
    totalRecords: number = 0;
    loading: boolean = true;

    // Pagination and Filter State
    rows: number = 10;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;

    // Column Management
    allColumns: Column[] = [
        { field: 'transactionNumber', header: 'Transaction Number' },
        { field: 'transactionDate', header: 'Date' },
        { field: 'fromAccount', header: 'From Account' },
        { field: 'toAccount', header: 'To Account' },
        { field: 'type', header: 'Type' },
        { field: 'transactionAmount', header: 'Amount' },
        { field: 'category', header: 'Category' },
        { field: 'transactionFeeAmount', header: 'Fee' },
        { field: 'note', header: 'Note' },
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 6)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    constructor(
        private route: ActivatedRoute,
        private financeService: PersonalFinanceService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Get bankId from the parent route parameter
        this.bankId = this.route.parent!.snapshot.paramMap.get('id')!;
    }

    // --- Data Loading & Filtering ---

    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        this.loadTransactions(event.sortField, event.sortOrder);
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.first = 0; // Reset pagination on new search
            this.loadTransactions();
        }, 500);
    }

    loadTransactions(sortField: string = '', sortOrder: number = 1): void {
        this.loading = true;
        this.skeletonData = new Array(this.rows).fill({});

        const pageNumber = Math.floor(this.first / this.rows) + 1;

        const filter =   {
            query:  this.searchQuery,
            pageNumber: pageNumber,
            pageSize: this.rows,
            filters: [
                {
                    "field": "BankBased",
                    "operator": "equal",
                    "value": this.bankId
                }
            ],
            sorts: []
        };

        this.financeService.searchTransactionsV2(filter).subscribe({
            next: (response: any) => {

                debugger;
                this.transactions = response.payload.data;
                this.totalRecords = response.payload.totalRecords;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading transactions:', err);
                this.transactions = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    // --- UI Helpers ---

    getTransactionType(typeId: number | undefined): FinanceTransactionTypeDto | undefined {
        if (typeId === undefined) return undefined;
        return FinanceTransactionType.All.find(t => t.id === typeId);
    }

    getTransactionTypeSeverity(typeId: number | undefined): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
        switch (this.getTransactionType(typeId)?.name) {
            case 'Income':
                return 'success';
            case 'Expense':
                return 'danger';
            case 'Transfer':
                return 'info';
            case 'CreditCardPayment':
                return 'warning';
            case 'Credit':
                return 'primary';
            default:
                return 'info';
        }
    }

    getCategorySeverity(category: FinanceCategoryRef | undefined): 'success' | 'warning' | 'info' | 'danger' {
        // A placeholder logic for category severity based on color or name
        if (!category) return 'info';
        const name = category.name?.toLowerCase();
        if (name?.includes('salary') || name?.includes('deposit')) return 'success';
        if (name?.includes('food') || name?.includes('rent')) return 'warning';
        if (name?.includes('loan') || name?.includes('card')) return 'danger';
        return 'info';
    }
}
