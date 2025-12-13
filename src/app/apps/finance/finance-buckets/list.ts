import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common'; // Include CurrencyPipe and DatePipe
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router'; // ADDED Router
import {PersonalFinanceService} from '@/apps/finance/finance.service'; // Adjust path as necessary
import {
    FinanceTransaction,
    FinanceTransactionSearchFilter, // The correct filter interface
    FinanceTransactionType, // Class for transaction types
    FinanceTransactionTypeDto,
    Money,
    FinanceCategoryRef, FinanceBucket, FinanceBucketSearchQuery, FinanceBank
} from '@/apps/finance/finance.types'; // Use the provided interfaces

// PrimeNG Imports
import {TableModule} from 'primeng/table';
import {PaginatorModule} from 'primeng/paginator';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {SkeletonModule} from 'primeng/skeleton';
import {MultiSelectModule} from 'primeng/multiselect';
import {SelectModule} from "primeng/select";
import {DialogModule} from 'primeng/dialog'; // New import for the filter dialog
import {InputNumberModule} from 'primeng/inputnumber';
import {DatePickerModule} from "primeng/datepicker";
import {go} from "thingies";
import {Menu} from "primeng/menu";
import {Confirmation, ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {ConfirmDialog} from "primeng/confirmdialog";
import {Toast} from "primeng/toast";

// Define the structure for transaction columns
interface Column {
    field: keyof FinanceBucket | 'actions'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}


@Component({
    selector: 'app-buckets',
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
        DatePickerModule,
        Menu,
        ConfirmDialog,
        Toast,
        // Using standard PrimeNG Calendar Module
    ],
    providers: [MessageService, DatePipe, ConfirmationService],

    template: `
        <div class="p-4">
            <p-toast></p-toast>
            <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>
            <h3 class="text-xl font-semibold mb-4">Buckets</h3>

            <div class="flex flex-column md:flex-row justify-end align-items-center mb-4 gap-3">

                <div class="p-inputgroup w-full md:w-30rem">
                    <input
                        type="text"
                        pInputText
                        placeholder="Search Buckets..."
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onSearchChange()">
                    <button type="button" pButton icon="pi pi-search" (click)="loadBuckets()"></button>
                </div>

                <!-- Action Buttons: Add Transaction, Filter, and Column Customization -->
                <div class="flex justify-end items-center gap-3 w-full">
                    <!-- NEW: Add Transaction Button -->
                    <div class="flex items-center gap-1">
                        <button pButton
                                icon="pi pi-plus"
                                label="Add Bucket"
                                class="p-button-primary p-button-sm"
                                (click)="goToAddBucket()">
                        </button>
                    </div>

                    <div class="flex items-center gap-1">
                        <button pButton icon="pi pi-filter" label="Filter"
                                class="p-button-outlined p-button-secondary p-button-sm"
                                (click)="showFilterModal()"></button>
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
                [value]="loading ? skeletonData : buckets"
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

                <ng-template pTemplate="body" let-bucket>
                    <tr *ngIf="loading">
                        <td *ngFor="let col of selectedColumns">
                            <p-skeleton></p-skeleton>
                        </td>
                    </tr>
                    <tr *ngIf="!loading">
                        <td *ngFor="let col of selectedColumns">
                            <ng-container [ngSwitch]="col.field">

                                <span *ngSwitchCase="'account'">
                                    {{ bucket.account?.name }}
                                </span>

                                <span *ngSwitchDefault>{{ bucket[col.field] }}</span>

                                <span *ngSwitchCase="'createdDate'">
                                    {{ bucket.createdDate | date: 'medium' }}
                                </span>

                                <span *ngSwitchCase="'periodStartTime'">
                                    {{ bucket.periodStartTime | date: 'medium' }}
                                </span>

                                <span *ngSwitchCase="'startDate'">
                                    {{ bucket.startDate | date: 'medium' }}
                                </span>

                                <span *ngSwitchCase="'endDate'">
                                    {{ bucket.endDate | date: 'medium' }}
                                </span>


                                <span *ngSwitchCase="'expectedIncomeAmount'"
                                      [ngClass]="{'text-red-500': bucket?.expectedIncomeAmount?.amount < 0, 'text-green-500': bucket?.expectedIncomeAmount?.amount >= 0}">
                                    {{ bucket?.expectedIncomeAmount?.amount | currency: bucket?.expectedIncomeAmount.currencyCode }}
                                </span>
                                <span *ngSwitchCase="'expectedExpenseAmount'"
                                      [ngClass]="{'text-red-500': bucket?.expectedExpenseAmount?.amount < 0, 'text-green-500': bucket?.expectedExpenseAmount?.amount >= 0}">
                                    {{ bucket?.expectedExpenseAmount?.amount | currency: bucket?.expectedExpenseAmount?.currencyCode }}
                                </span>
                                <span *ngSwitchCase="'expectedTransferAmount'"
                                      [ngClass]="{'text-red-500': bucket?.expectedTransferAmount?.amount < 0, 'text-green-500': bucket?.expectedTransferAmount?.amount >= 0}">
                                    {{ bucket?.expectedTransferAmount?.amount | currency: bucket?.expectedTransferAmount?.currencyCode }}
                                </span>
                                <span *ngSwitchCase="'expectedCreditCardPaymentAmount'"
                                      [ngClass]="{'text-red-500': bucket?.expectedCreditCardPaymentAmount?.amount < 0, 'text-green-500': bucket?.expectedCreditCardPaymentAmount?.amount >= 0}">
                                    {{ bucket?.expectedCreditCardPaymentAmount?.amount | currency: bucket?.expectedCreditCardPaymentAmount?.currencyCode }}
                                </span>
                                <span *ngSwitchCase="'expectedCreditAmount'"
                                      [ngClass]="{'text-red-500': bucket?.expectedCreditAmount?.amount < 0, 'text-green-500': bucket?.expectedCreditAmount?.amount >= 0}">
                                    {{ bucket?.expectedCreditAmount?.amount | currency: bucket?.expectedCreditAmount?.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'isCompleted'">
                                        <p-tag
                                            [value]="bucket.isCompleted ? 'Completed' : 'Active'"
                                            [severity]="getSeverity(bucket)">
                                            </p-tag>
                                </span>


                                <span *ngSwitchCase="'actions'">
                                    <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded"
                                            (click)="setMenuTarget(bucket); menu.toggle($event)"></button>
                                </span>


                            </ng-container>
                        </td>
                    </tr>
                </ng-template>

                <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td [attr.colspan]="selectedColumns.length" class="text-center p-4">
                            No buckets found for the current criteria.
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
            <ng-template pTemplate="footer">
                <div class="flex justify-content-between">
                    <p-button label="Clear Filters" icon="pi pi-refresh" class="p-button-danger p-button-text"
                              (click)="clearFilters()"></p-button>
                    <div class="flex gap-2">
                        <p-button label="Cancel" icon="pi pi-times" class="p-button-secondary p-button-text"
                                  (click)="displayFilterModal = false"></p-button>
                        <p-button label="Apply" icon="pi pi-check" class="p-button-info"
                                  (click)="applyFilters()"></p-button>
                    </div>
                </div>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host {
            display: block;
        }

        .p-datatable-wrapper {
            border: 1px solid var(--surface-border);
            border-radius: var(--border-radius);
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BucketsComponent implements OnInit {

    buckets: FinanceBucket[] = [];
    totalRecords: number = 0;
    loading: boolean = true;

    // Pagination and Filter State
    rows: number = 10;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;

    // Column Management
    allColumns: Column[] = [
        {field: 'name', header: 'Name'},
        {field: 'periodStartTime', header: 'Period Start Time'},
        {field: 'account', header: 'Account'},
        {field: 'startDate', header: 'Start Date'},
        {field: 'endDate', header: 'End Date'},
        {field: 'expectedIncomeAmount', header: 'Expected Income Amount'},
        {field: 'expectedExpenseAmount', header: 'Expected Expense Amount'},
        {field: 'expectedTransferAmount', header: 'Expected Transfer Amount'},
        {field: 'expectedCreditCardPaymentAmount', header: 'Expected Credit Card Payment Amount'},
        {field: 'expectedCreditAmount', header: 'Expected Credit Amount'},
        {field: 'isCompleted', header: 'Completed'},
        {field: 'createdDate', header: 'Created Date'},
        {field: 'actions', header: 'Actions'}
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 13)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    // Filter State
    displayFilterModal: boolean = false;
    // Keep IDs as number for consistency
    transactionTypes = FinanceTransactionType.All.map(t => ({id: t.id.toString(), displayName: t.displayName}));
    // Will be populated by API call
    availableCategories: FinanceCategoryRef[] = [];
    menuItems: MenuItem[] = [];
    selectedBucket!: FinanceBucket;
    displayDetailModal: boolean = false; // <-- New property for detail dialog
    selectedTransaction!: FinanceTransaction;
    constructor(
        private route: ActivatedRoute,
        private financeService: PersonalFinanceService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private _confirmationService: ConfirmationService,
        private _messageService: MessageService// INJECTED Router
    ) {
    }

    ngOnInit(): void {
        this.getAvailableCategories();
        // Load initial data
        this.loadBuckets();
        this.initMenu();
    }

    // --- Navigation Methods ---
    goToAddBucket(): void {
        // Navigate to the transaction creation page. Adjust the route path as needed for your application's routing setup.
        this.router.navigate(['apps/finance/buckets/create']);
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
        this.loadBuckets();
    }

    clearFilters(): void {

        this.applyFilters();
    }


    // --- Data Loading & Filtering ---

    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        // PrimeNG sorts are not fully implemented here, so we only pass basic info
        this.loadBuckets(event.sortField, event.sortOrder);
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.first = 0; // Reset pagination on new search
            this.loadBuckets(); // Trigger load after search change
        }, 500);
    }

    loadBuckets(sortField: string = '', sortOrder: number = 1): void {
        this.loading = true;
        this.skeletonData = new Array(this.rows).fill({});

        const pageNumber = Math.floor(this.first / this.rows) + 1;

        // Construct the filters array based on currentFilters state


        const filter: FinanceBucketSearchQuery = {
            paginationFilter: {
                pageNumber: pageNumber,
                pageSize: this.rows,
            },
            search: {
                value: this.searchQuery
            }
        };

        this.financeService.searchBuckets(filter).subscribe({
            next: (response: any) => {
                this.buckets = response.data;
                this.totalRecords = response.totalRecords;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading transactions:', err);
                this.buckets = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    initMenu() {
        this.menuItems = [
            {
                label: 'Options',
                items: [
                    {label: 'Detail', icon: 'pi pi-eye', command: () => this.viewDetail(this.selectedBucket)},
                    {
                        label: 'Delete',
                        icon: 'pi pi-trash',
                        styleClass: 'text-red-500',
                        command: () => this.delete(this.selectedBucket)
                    },
                    {label: 'Complete', icon: 'pi pi-check', command: () => this.complete(this.selectedBucket)},

                ]
            }
        ];
    }

    setMenuTarget(bucket: FinanceBucket) {
        this.selectedBucket = bucket;
    }

    viewDetail(bucket: FinanceBucket) {
        this.router.navigate(['apps/finance/buckets/' + bucket.id + '/edit']);
    }

    delete(bucket: FinanceBucket) {
        this._confirmationService.confirm({
            message: `Are you sure you want to delete the bucket whose name is ${bucket?.name}?`,
            header: 'Confirm Finance Bucket',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deleteBucket(bucket);
            },
            reject: () => {
                this._messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    deleteBucket(bucket: FinanceBucket) {
        this.financeService.deleteBucket(bucket?.id ?? "")
            .subscribe({
                next: () => {
                    this._messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: `The bucket has been successfully deleted.`
                    });
                    this.loadBuckets();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this._messageService.add({severity: 'error', summary: 'Error', detail: `Failed to delete bucket.`});
                }
            });
    }

    complete(bucket: FinanceBucket) {
        this._confirmationService.confirm({
            message: `Are you sure you want to complete the bucket whose name is ${bucket?.name}?`,
            header: 'Confirm Finance Bucket',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.completeBucket(bucket);
            },
            reject: () => {
                this._messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Completion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    completeBucket(bucket: FinanceBucket) {
        this.financeService.completeBucket(bucket?.id ?? "")
            .subscribe({
                next: () => {

                    this._messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: `The bucket has been successfully completed.`
                    });

                    this.loadBuckets();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this._messageService.add({severity: 'error', summary: 'Error', detail: `Failed to completed bucket.`});
                }
            });
    }

    getSeverity(bank: FinanceBucket) {
        return bank.isCompleted ? 'success' : 'danger';
    }

    protected readonly go = go;
}
