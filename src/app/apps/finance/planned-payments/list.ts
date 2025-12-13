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
    FinanceBucket
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

// Define the structure for transaction columns
interface Column {
    field: keyof FinancePlannedPayment | 'actions'; // Use interface keys
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
        // Using standard PrimeNG Calendar Module
    ],
    providers: [MessageService, DatePipe, ConfirmationService],

    template: `
        <div class="p-4">
            <p-toast></p-toast>
            <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>
            <h3 class="text-xl font-semibold mb-4">Planned Payment Plans</h3>

            <div class="flex flex-column md:flex-row justify-end align-items-center mb-4 gap-3">

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
                                      [ngClass]="{'text-red-500': plannedPayment.amount.amount < 0, 'text-green-500': plannedPayment.amount.amount >= 0}">
                                    {{ plannedPayment.amount.amount | currency: plannedPayment.amount.currencyCode }}
                                </span>

                                <span *ngSwitchCase="'createdDate'">
                                    {{ plannedPayment.createdDate | date: 'medium' }}
                                </span>

                                <span *ngSwitchCase="'isActive'">
                                        <p-tag
                                            [value]="plannedPayment.isActive ? 'Active' : 'Passive'"
                                            [severity]="getSeverity(plannedPayment)">
                                            </p-tag>
                                </span>

                                <span *ngSwitchCase="'isManual'">
                                        <p-tag
                                            [value]="!plannedPayment.isManual ? 'Auto' : 'Manual'"
                                            [severity]="getManual(plannedPayment)">
                                            </p-tag>
                                </span>

                                <span *ngSwitchCase="'actions'">
                                    <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded"
                                            (click)="setMenuTarget(plannedPayment); menu.toggle($event)"></button>
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
export class PlannedPaymentsComponent implements OnInit {

    plannedPayments: FinancePlannedPayment[] = [];
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
        {field: 'type', header: 'Type'},
        {field: 'amount', header: 'Amount'},
        {field: 'isActive', header: 'Active'},
        {field: 'isManual', header: 'Manual'},

        {field: 'parentCategory', header: 'Parent Category'},
        {field: 'createdDate', header: 'Created Date'},
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 6)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    menuItems: MenuItem[] = [];
    selectedFinancePlannedPayment!: FinancePlannedPayment;

    constructor(
        private route: ActivatedRoute,
        private financeService: PersonalFinanceService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private _confirmationService: ConfirmationService,
        private _messageService: MessageService
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

        const filter: SearchFilter = {
            search: {
                value: this.searchQuery
            },
            paginationFilter: {
                pageNumber: pageNumber,
                pageSize: this.rows
            }
        };

        this.financeService.searchFinancePlannedPayments(filter).subscribe({
            next: (response: any) => {
                this.plannedPayments = response.data;
                this.totalRecords = response.totalRecords;
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
        this._confirmationService.confirm({
            message: `Are you sure you want to delete the planned payment whose name is ${plannedPayment?.name}?`,
            header: 'Confirm Finance Bucket',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deletePlannedPayment(plannedPayment);
            },
            reject: () => {
                this._messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    deletePlannedPayment(plannedPayment: FinancePlannedPayment) {
        this.financeService.deletePlannedPayment(plannedPayment?.id ?? "")
            .subscribe({
                next: () => {
                    this._messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: `The planned payment has been successfully deleted.`
                    });

                    this.loadInstallmentPlans();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this._messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to delete planned payment.`
                    });
                }
            });
    }

    getSeverity(bank: FinancePlannedPayment) {
        return bank.isActive ? 'success' : 'danger';
    }
    getManual(bank: FinancePlannedPayment) {
        return bank.isManual ? 'danger' : 'success';
    }
}
