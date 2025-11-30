import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; // Include CurrencyPipe and DatePipe
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // ADDED Router
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
import { SelectModule } from "primeng/select";
import { DialogModule } from 'primeng/dialog'; // New import for the filter dialog
import { InputNumberModule } from 'primeng/inputnumber';
import {DatePickerModule} from "primeng/datepicker";

// Define the structure for transaction columns
interface Column {
    field: keyof FinanceTransaction | 'displayAmount'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}

// Define the filter model structure
interface TransactionFilterModel {
    transactionTypeIds: number[] | null;
    categoryIds: string[] | null;
    minAmount: number | null;
    maxAmount: number | null;
    startDate: Date | null;
    endDate: Date | null;
}

@Component({
    selector: 'app-transactions',
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
        SelectModule,
        DialogModule, // Added
        InputNumberModule, // Added
        DatePickerModule // Using standard PrimeNG Calendar Module
    ],
    template: `
        <div class="p-4">
            <h3 class="text-xl font-semibold mb-4">Transaction History</h3>

            <div class="flex flex-column md:flex-row justify-end align-items-center mb-4 gap-3">

                <div class="p-inputgroup w-full md:w-30rem">
                    <input
                        type="text"
                        pInputText
                        placeholder="Search Transactions..."
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onSearchChange()">
                    <button type="button" pButton icon="pi pi-search" (click)="loadTransactions()"></button>
                </div>

                <!-- Action Buttons: Add Transaction, Filter, and Column Customization -->
                <div class="flex justify-end items-center gap-3 w-full">
                    <!-- NEW: Add Transaction Button -->
                    <div class="flex items-center gap-1">
                        <button pButton
                                icon="pi pi-plus"
                                label="Add Transaction"
                                class="p-button-primary p-button-sm"
                                (click)="goToAddTransaction()">
                        </button>
                    </div>

                    <div class="flex items-center gap-1">
                        <button pButton icon="pi pi-filter" label="Filter" class="p-button-outlined p-button-secondary p-button-sm" (click)="showFilterModal()"></button>
                    </div>

                    <div class="flex items-center gap-1">
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
            </div>

            <p-table
                [value]="loading ? skeletonData : transactions"
                [scrollable]="true"
                scrollHeight="1000px"
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

                                <span *ngSwitchCase="'transactionFeeAmount'" [ngClass]="{'text-red-500': transaction.transactionFeeAmount?.amount < 0, 'text-green-500': transaction.transactionFeeAmount?.amount >= 0}">
                                    {{ transaction.transactionFeeAmount?.amount | currency: transaction.transactionFeeAmount?.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'transactionTransferredAmount'" [ngClass]="{'text-red-500': transaction.transactionTransferredAmount?.amount < 0, 'text-green-500': transaction.transactionTransferredAmount?.amount >= 0}">
                                    {{ transaction.transactionTransferredAmount?.amount | currency: transaction.transactionTransferredAmount?.currencyCode }}
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

                                <span *ngSwitchCase="'createdDate'">
                                    {{ transaction.createdDate | date: 'medium' }}
                                </span>
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

        <!-- Filter Dialog -->
        <p-dialog
            header="Filter Transactions"
            [(visible)]="displayFilterModal"
            [modal]="true"
            [style]="{width: '650px',  height: '90vh', 'max-height': '600px'}"
            [resizable]="false"
            [draggable]="false">

            <div class="row">
                <!-- Transaction Type Filter -->
                <div class="col-12 field">
                    <label for="typeFilter" class="font-medium mb-2 block">Transaction Type</label>
                    <p-multiSelect
                        id="typeFilter"
                        [options]="transactionTypes"
                        optionLabel="displayName"
                        optionValue="id"
                        [(ngModel)]="currentFilters.transactionTypeIds"
                        placeholder="Select Types"
                        display="chip"
                        styleClass="w-full">
                    </p-multiSelect>
                </div>

                <!-- Category Filter -->
                <div class="col-12 field mt-4">
                    <label for="categoryFilter" class="font-medium mb-2 block">Category</label>
                    <p-multiSelect
                        id="categoryFilter"
                        [options]="availableCategories"
                        optionLabel="name"
                        optionValue="id"
                        [(ngModel)]="currentFilters.categoryIds"
                        placeholder="Select Categories"
                        display="chip"
                        styleClass="w-full">
                    </p-multiSelect>
                </div>


                <!-- Date Range Filter: Using p-calendar (Datetime Picker) -->
                <div class="col-12 field mt-4">
                    <label class="font-medium mb-2 block">Transaction Date Range</label>
                    <div class="p-inputgroup">
                        <p-date-picker
                            [(ngModel)]="currentFilters.startDate"
                            placeholder="Start Date/Time"
                            dateFormat="yy/mm/dd"
                            [showTime]="true"
                            [hourFormat]="'24'"
                            appendTo="body"
                            styleClass="w-full"
                        ></p-date-picker>
                        <span class="p-inputgroup-addon">to</span>
                        <p-date-picker
                            [(ngModel)]="currentFilters.endDate"
                            placeholder="End Date/Time"
                            dateFormat="yy/mm/dd"
                            [showTime]="true"
                            [hourFormat]="'24'"
                            appendTo="body"
                            styleClass="w-full"
                        ></p-date-picker>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-between">
                    <p-button label="Clear Filters" icon="pi pi-refresh" class="p-button-danger p-button-text" (click)="clearFilters()"></p-button>
                    <div class="flex gap-2">
                        <p-button label="Cancel" icon="pi pi-times" class="p-button-secondary p-button-text" (click)="displayFilterModal = false"></p-button>
                        <p-button label="Apply" icon="pi pi-check" class="p-button-info" (click)="applyFilters()"></p-button>
                    </div>
                </div>
            </ng-template>
        </p-dialog>
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
export class TransactionsComponent implements OnInit {

    transactions: FinanceTransaction[] = [];
    totalRecords: number = 0;
    loading: boolean = true;

    // Pagination and Filter State
    rows: number = 50;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;

    // Column Management
    allColumns: Column[] = [
        { field: 'transactionNumber', header: 'Transaction Number' },
        { field: 'fromAccount', header: 'From Account' },
        { field: 'toAccount', header: 'To Account' },
        { field: 'type', header: 'Type' },
        { field: 'transactionAmount', header: 'Amount' },
        { field: 'transactionDate', header: 'Transaction Date' },
        { field: 'category', header: 'Category' },
        { field: 'transactionFeeAmount', header: 'Fee' },
        { field: 'transactionTransferredAmount', header: 'Transferred Amount' },
        { field: 'note', header: 'Note' },
        { field: 'createdDate', header: 'Created Date' },
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 6)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    // Filter State
    displayFilterModal: boolean = false;
    // Keep IDs as number for consistency
    transactionTypes = FinanceTransactionType.All.map(t => ({ id: t.id.toString(), displayName: t.displayName }));
    // Will be populated by API call
    availableCategories: FinanceCategoryRef[] = [];

    currentFilters: TransactionFilterModel = {
        transactionTypeIds: null,
        categoryIds: null,
        minAmount: null,
        maxAmount: null,
        startDate: null,
        endDate: null,
    };

    constructor(
        private route: ActivatedRoute,
        private financeService: PersonalFinanceService,
        private cdr: ChangeDetectorRef,
        private router: Router // INJECTED Router
    ) { }

    ngOnInit(): void {
        this.getAvailableCategories();
        // Load initial data
        this.loadTransactions();
    }

    // --- Navigation Methods ---
    goToAddTransaction(): void {
        // Navigate to the transaction creation page. Adjust the route path as needed for your application's routing setup.
        this.router.navigate(['/finance/transactions/new']);
    }

    // --- Data Fetching Methods ---

    getAvailableCategories(): void {
        this.financeService.getFinanceCategories(1, 100000).subscribe({
            next: (response: any) => {
                if (response && response.data) {
                    // Assuming payload contains an array of category objects matching FinanceCategoryRef interface
                    this.availableCategories = response.data || [];
                    this.cdr.detectChanges();
                }
            },
            error: (err: any) => {
                console.error('Error loading categories:', err);
                // Keep availableCategories empty or handle error display
            }
        });
    }

    // --- UI Methods ---
    showFilterModal(): void {
        this.displayFilterModal = true;
    }

    applyFilters(): void {
        this.displayFilterModal = false;
        // Reset pagination and reload data
        this.first = 0;
        this.loadTransactions();
    }

    clearFilters(): void {
        this.currentFilters = {
            transactionTypeIds: null,
            categoryIds: null,
            minAmount: null,
            maxAmount: null,
            startDate: null,
            endDate: null,
        };
        this.applyFilters();
    }


    // --- Data Loading & Filtering ---

    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        // PrimeNG sorts are not fully implemented here, so we only pass basic info
        this.loadTransactions(event.sortField, event.sortOrder);
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.first = 0; // Reset pagination on new search
            this.loadTransactions(); // Trigger load after search change
        }, 500);
    }

    loadTransactions(sortField: string = '', sortOrder: number = 1): void {
        this.loading = true;
        this.skeletonData = new Array(this.rows).fill({});

        const pageNumber = Math.floor(this.first / this.rows) + 1;

        // Construct the filters array based on currentFilters state
        const filters: any[] = [];

        if (this.currentFilters.transactionTypeIds && this.currentFilters.transactionTypeIds.length > 0) {
            // Transaction type IDs are numbers, stringify the array for 'in' operator value
            filters.push({
                field: 'Type',
                operator: 'in',
                value: JSON.stringify(this.currentFilters.transactionTypeIds)
            });
        }

        if (this.currentFilters.categoryIds && this.currentFilters.categoryIds.length > 0) {
            // Category IDs are strings, stringify the array for 'in' operator value
            filters.push({
                field: 'Category.Id',
                operator: 'in',
                value: JSON.stringify(this.currentFilters.categoryIds)
            });
        }

        // Amount filters using the custom operators provided
        if (this.currentFilters.minAmount !== null) {
            filters.push({ field: 'TransactionAmount', operator: 'greater_than_equal', value: this.currentFilters.minAmount.toString() });
        }
        if (this.currentFilters.maxAmount !== null) {
            filters.push({ field: 'TransactionAmount', operator: 'less_than_equal', value: this.currentFilters.maxAmount.toString() });
        }

        // Date range filter using the custom 'range' operator provided
        if (this.currentFilters.startDate && this.currentFilters.endDate) {
            // Convert Date object from p-calendar to ISO 8601 string for backend
            filters.push({
                field: 'TransactionDate',
                operator: 'range',
                value: JSON.stringify([ this.currentFilters.startDate.toISOString(), this.currentFilters.endDate.toISOString()])
            });
        }


        const filter =   {
            query:  this.searchQuery,
            pageNumber: pageNumber,
            pageSize: this.rows,
            filters: filters,
            sorts: [
                // Add sort logic here if needed
            ]
        };

        this.financeService.searchTransactionsV2(filter).subscribe({
            next: (response: any) => {
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
