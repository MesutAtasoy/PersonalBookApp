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
    FinanceCategoryRef,
    FinanceInstallmentPlanSearchFilter,
    FinanceInstallmentPlanDto,
    FinancePlannedPayment,
    FinanceBucket,
    FinancePlannedPaymentItemSearchFilter,
    FinancePlannedPaymentItem,
    FinancePlannedPaymentItemStatus,
    DateTimeRangeTypeDto, DateTimeRangeType
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
import {SearchFilter} from "@/core/pagination/personal-book.pagination";
import {Confirmation, ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {Menu} from "primeng/menu";
import {ConfirmDialog} from "primeng/confirmdialog";
import {Toast} from "primeng/toast";
import moment from "moment/moment";
import {Divider} from "primeng/divider";

// Define the structure for transaction columns
interface Column {
    field: keyof FinancePlannedPaymentItem | 'actions'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}


@Component({
    selector: 'app-installment-plans',
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
        Divider,
        // Using standard PrimeNG Calendar Module
    ],
    providers: [MessageService, DatePipe, ConfirmationService],

    template: `
        <div class="p-4">
            <p-toast></p-toast>
            <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>

            <h3 class="text-xl font-semibold mb-4">Planned Payment Plans</h3>

            <p-divider/>

            <div class="flex justify-between align-items-center mb-3">
                <div class="text-xl font-semibold">Summary  {{ dateSummaryText }}</div>
                <span>{{statRequest.filter.dateTimeRange.startDate | date: 'short' }} - {{statRequest.filter.dateTimeRange.endDate | date: 'short' }}</span>
                <p-button
                    label="Filter"
                    icon="pi pi-filter"
                    (onClick)="showFilterDialog = true">
                </p-button>
            </div>

            <div class="grid gap-2 mt-4">
                <div class="flex w-full" *ngFor="let statItem of stats">
                    <div class="card w-full h-full flex flex-col items-center justify-center">
                        <span class="text-surface-900 dark:text-surface-0 text-lg mb-6 font-medium">{{ statItem.currencyCode }}</span>
                        <div class="flex justify-between gap-2">
                            <div class="card  mt-4" *ngFor="let transaction of statItem.transactions">
                                {{ getType(transaction.type)?.displayName }} ({{transaction.count}})

                                <div *ngFor="let status of transaction.statues">
                                    {{getStatus(status.status)}} ({{status.count}}) - {{status.amount  | currency: statItem.currencyCode }}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <p-divider/>

            <div class="flex flex-column md:flex-row justify-end align-items-center mt-4 mb-4 gap-3">

                <div class="p-inputgroup w-full md:w-30rem">
                    <input
                        type="text"
                        pInputText
                        placeholder="Search Planned Payment Plans..."
                        [(ngModel)]="searchQuery"
                        (ngModelChange)="onSearchChange()">
                    <button type="button" pButton icon="pi pi-search" (click)="loadInstallmentPlans()"></button>
                </div>

                <!-- Action Buttons: Add Transaction, Filter, and Column Customization -->
                <div class="flex justify-end items-center gap-3 w-full">
                    <!-- NEW: Add Transaction Button -->
                    <div class="flex items-center gap-1">
                        <button pButton
                                icon="pi pi-plus"
                                label="Add Planned Payment Plan"
                                class="p-button-primary p-button-sm"
                                (click)="goToAddTransaction()">
                        </button>
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
                [value]="loading ? skeletonData : plannedPayments"
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

                <ng-template pTemplate="body" let-plannedPayment>
                    <tr *ngIf="loading">
                        <td *ngFor="let col of selectedColumns">
                            <p-skeleton></p-skeleton>
                        </td>
                    </tr>
                    <tr *ngIf="!loading">
                        <td *ngFor="let col of selectedColumns">
                            <ng-container [ngSwitch]="col.field">

                                 <span *ngSwitchCase="'name'">
                                    {{ plannedPayment?.name }}
                                </span>

                                <span *ngSwitchCase="'account'">
                                    {{ plannedPayment.account?.name }}
                                </span>

                                <span *ngSwitchCase="'bank'"> {{ plannedPayment.bank?.name }} </span>

                                <p-tag
                                    *ngSwitchCase="'category'"
                                    [value]="plannedPayment.category?.name || 'N/A'">
                                </p-tag>

                                <p-tag
                                    *ngSwitchCase="'parentCategory'"
                                    [value]="plannedPayment.parentCategory?.name || 'N/A'">
                                </p-tag>

                                <p-tag
                                    *ngSwitchCase="'type'"
                                    [value]="getType(plannedPayment.type)?.displayName || 'Unknown'"
                                    [icon]="'pi pi-' + getType(plannedPayment.type)?.icon">
                                </p-tag>

                                <span *ngSwitchCase="'amount'"
                                      [ngClass]="{'text-red-500': plannedPayment.amount?.amount < 0, 'text-green-500': plannedPayment.amount?.amount >= 0}">
                                    {{ plannedPayment.amount?.amount | currency: plannedPayment.amount?.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'paidAmount'"
                                      [ngClass]="{'text-red-500': plannedPayment.paidAmount?.amount < 0, 'text-green-500': plannedPayment.paidAmount?.amount >= 0}">
                                    {{ plannedPayment.paidAmount?.amount | currency: plannedPayment.paidAmount?.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'createdDate'">
                                    {{ plannedPayment.createdDate | date: 'medium' }}
                                </span>

                                <span *ngSwitchCase="'status'">
                                                {{ getStatus(plannedPayment.status) }}
                                            </span>

                                <span *ngSwitchCase="'actions'">
                                    <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded"
                                            (click)="setMenuTarget(plannedPayment); menu.toggle($event)"></button>
                                </span>

                                <span *ngSwitchCase="'dueDate'">
                                                {{ plannedPayment.dueDate | date: 'medium' }}
                                            </span>

                            </ng-container>
                        </td>
                    </tr>
                </ng-template>
                <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

                <ng-template pTemplate="emptymessage" *ngIf="!loading">
                    <tr>
                        <td [attr.colspan]="selectedColumns.length" class="text-center p-4">
                            No transactions found for the current criteria.
                        </td>
                    </tr>
                </ng-template>

            </p-table>

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
                        appendTo="body"
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
                            appendTo="body">
                        </p-date-picker>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">Choose a end date</label>
                        <p-date-picker
                            [(ngModel)]="tempFilter.endDate"
                            [showIcon]="true"
                            dateFormat="dd M yy"
                            name="endDate"
                            appendTo="body">
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
        </div>
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
export class PlannedPaymentOverviewComponent implements OnInit {

    plannedPayments: FinancePlannedPaymentItem[] = [];
    totalRecords: number = 0;
    loading: boolean = true;

    // Pagination and Filter State
    rows: number = 50;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;

    // Column Management
    allColumns: Column[] = [
        {field: 'actions', header: "Actions"},
        {field: 'name', header: 'Name'},
        {field: 'account', header: 'Account'},
        {field: 'bank', header: 'Bank'},
        {field: 'category', header: 'Category'},
        {field: 'dueDate', header: 'Due Date'},
        {field: 'type', header: 'Type'},
        {field: 'status', header: 'Status'},
        {field: 'amount', header: 'Amount'},
        {field: 'paidAmount', header: 'Paid Amount'},
        {field: 'parentCategory', header: 'Parent Category'},
        {field: 'createdDate', header: 'Created Date'},
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 6)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    menuItems: MenuItem[] = [];
    selectedFinancePlannedPayment!: FinancePlannedPayment;

    showFilterDialog: boolean = false;
    dateTimeRangeOptions: DateTimeRangeTypeDto[] = DateTimeRangeType.All;

    filterParameters = {
        filter: DateTimeRangeType.All[9].id, // Default to Last 12 Month
        startDate: null as Date | null,
        endDate: null as Date | null,
    };

    tempFilter: { filter: number, startDate: Date | null, endDate: Date | null } = {...this.filterParameters};
    stats : any;
    statRequest : any;
    constructor(
        private route: ActivatedRoute,
        private financeService: PersonalFinanceService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
    }

    ngOnInit(): void {
        this.loadInstallmentPlans();
        this.initMenu();
    }

    // --- Navigation Methods ---
    goToAddTransaction(): void {
        // Navigate to the transaction creation page. Adjust the route path as needed for your application's routing setup.
        this.router.navigate(['apps/finance/planned-payments/create']);
    }

    onLazyLoad(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        // PrimeNG sorts are not fully implemented here, so we only pass basic info
        this.loadInstallmentPlans(event.sortField, event.sortOrder);
    }

    onSearchChange() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.first = 0; // Reset pagination on new search
            this.loadInstallmentPlans(); // Trigger load after search change
        }, 500);
    }

    loadInstallmentPlans(sortField: string = '', sortOrder: number = 1): void {
        this.loading = true;
        this.skeletonData = new Array(this.rows).fill({});

        const pageNumber = Math.floor(this.first / this.rows) + 1;

        const filter: FinancePlannedPaymentItemSearchFilter = {
            search: {
                value: this.searchQuery
            },
            filter: {
                dateTimeRange: {
                    type: this.filterParameters.filter,
                    startDate: this.filterParameters.filter === 9 && this.filterParameters.startDate ? moment(this.filterParameters.startDate).format('YYYY-MM-DD') : undefined,
                    endDate: this.filterParameters.filter === 9 && this.filterParameters.endDate ? moment(this.filterParameters.endDate).format('YYYY-MM-DD') : undefined
                }
            },
            paginationFilter: {
                pageNumber: pageNumber,
                pageSize: this.rows
            }
        };

        this.financeService.searchFinancePlannedPaymentItems(filter).subscribe({
            next: (response: any) => {
                this.plannedPayments = response.data.data;
                this.totalRecords = response.data.totalRecords;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading transactions:', err);
                this.plannedPayments = [];
                this.totalRecords = 0;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        this.financeService.financePlannedPaymentItemStats(filter)
            .subscribe({
                next: (response: any) => {
                    debugger;
                    this.statRequest = response.payload.request;
                    this.stats = response.payload.data;
                    this.cdr.detectChanges();
                },
                    error: (err: any) => {
                    console.error('Error loading transactions:', err);
                    this.cdr.detectChanges();
                }
            })
    }

    getType(typeId: number | undefined): FinanceTransactionTypeDto | undefined {
        if (typeId === undefined) return undefined;
        return FinanceTransactionType.All.find(t => t.id === typeId);
    }

    getTypeSeverity(typeId: number | undefined): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
        switch (this.getType(typeId)?.name) {
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

    initMenu() {
        this.menuItems = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Detail',
                        icon: 'pi pi-eye',
                        command: () => this.viewDetail(this.selectedFinancePlannedPayment)
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-trash',
                        styleClass: 'text-red-500',
                        command: () => this.delete(this.selectedFinancePlannedPayment)
                    },
                ]
            }
        ];
    }

    setMenuTarget(plannedPayment: FinancePlannedPayment) {
        this.selectedFinancePlannedPayment = plannedPayment;
    }

    viewDetail(bucket: FinancePlannedPayment) {
        this.router.navigate(['apps/finance/planned-payments/' + bucket.id + '/details']);
    }

    delete(plannedPayment: FinancePlannedPayment) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the planned payment whose name is ${plannedPayment?.name}?`,
            header: 'Confirm Finance Bucket',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deletePlannedPayment(plannedPayment);
            },
            reject: () => {
                this.messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    deletePlannedPayment(plannedPayment: FinancePlannedPayment) {
        this.financeService.deletePlannedPayment(plannedPayment?.id ?? "")
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: `The planned payment has been successfully deleted.`
                    });

                    this.loadInstallmentPlans();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to delete planned payment.`
                    });
                }
            });
    }

    getStatus(status: number) {
        let itemStatus = FinancePlannedPaymentItemStatus.All.find(x => x.id === status)?.displayName;
        return itemStatus;
    }

    onFilterTypeChange(): void {
        if (this.tempFilter.filter !== 9) {
            this.tempFilter.startDate = null;
            this.tempFilter.endDate = null;
        }
    }

    applyFilter(): void {
        if (this.tempFilter.filter === 9) {
            if (!this.tempFilter.startDate || !this.tempFilter.endDate) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Filter',
                    detail: 'Start and end dates are required for Range filter.'
                });
                return;
            }
            if (this.tempFilter.startDate > this.tempFilter.endDate) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Filter',
                    detail: 'Start date cannot be after end date.'
                });
                return;
            }
        }

        this.filterParameters.filter = this.tempFilter.filter;
        this.filterParameters.startDate = this.tempFilter.startDate;
        this.filterParameters.endDate = this.tempFilter.endDate;

        this.showFilterDialog = false;
        this.loadInstallmentPlans();
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
    }

    resetFilterDialog(): void {
        this.tempFilter = {...this.filterParameters};
    }

    // --- Helper Getters (Unchanged) ---

    get dateSummaryText(): any {
        const currentFilter = this.dateTimeRangeOptions.find(o => o.id === this.filterParameters.filter);

        if (this.filterParameters.filter === 9 && this.filterParameters.startDate && this.filterParameters.endDate) {
            const start = moment(this.filterParameters.startDate).format('DD MMM YYYY');
            const end = moment(this.filterParameters.endDate).format('DD MMM YYYY');
            return `${start} - ${end}`;
        }

        if (currentFilter) {
            return currentFilter?.displayName;
        }
    }
}
