import {CommonModule, DatePipe} from '@angular/common';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {SelectModule} from 'primeng/select';
import {DialogModule} from 'primeng/dialog';
import {SkeletonModule} from 'primeng/skeleton';
import {ToastModule} from 'primeng/toast';
import {Confirmation, ConfirmationService, MenuItem, MessageService} from 'primeng/api';
import {RRule, Frequency} from 'rrule';
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {DatePickerModule} from "primeng/datepicker";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {TextareaModule} from "primeng/textarea";
import {
    FinanceAccount,
    FinanceBucket,
    FinanceCategory, FinanceInstallmentDetailDto,
    FinancePlannedPayment,
    FinancePlannedPaymentItem,
    FinancePlannedPaymentItemSearchFilter,
    FinancePlannedPaymentItemStatus,
    FinanceTransactionType,
    FinanceTransactionTypeDto
} from "@/apps/finance/finance.types";
import {
    CalendarRecurrenceComponent,
} from "@/apps/finance/planned-payments/recurrence-dialog.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import moment from "moment";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "primeng/tabs";
import {ActivatedRoute} from "@angular/router";
import {Menu} from "primeng/menu";
import {MultiSelect} from "primeng/multiselect";
import {TableModule} from "primeng/table";
import {Tag} from "primeng/tag";

interface RRuleForm {
    freq: Frequency;
    interval: number;
    countOrUntil: 'count' | 'until';
    count: number | null;
    until: Date | null;
}

interface Column {
    field: keyof FinancePlannedPaymentItem | 'actions'; // Use interface keys
    header: string;
    pipe?: 'currency' | 'date' | 'type' | 'category';
}

interface PaymentRequest {
    amount: number;
    transactionName: string;
    isCompleted: boolean;
}


// --- END TYPE DEFINITIONS ---

@Component({
    selector: 'app-add-installment-plan',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DatePickerModule,
        SelectModule,
        ToggleSwitchModule,
        TextareaModule,
        DialogModule,
        SkeletonModule,
        ToastModule,
        CalendarRecurrenceComponent,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        Menu,
        MultiSelect,
        TableModule,
        Tag,
    ],
    providers: [MessageService, DatePipe, DialogService, ConfirmationService],
    template: `
        <div class="card p-4">
            <p-toast></p-toast>

            <h2 class="text-2xl font-semibold mb-4">💰 {{ selectedPlan?.name ?? "" }} | Installment Plans</h2>

            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">Details</p-tab>
                    <p-tab value="1">Planned Items</p-tab>
                </p-tablist>
                <p-tabpanels>
                    <p-tabpanel value="0">
                        <div class="mt-4">
                            <form #planForm="ngForm">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-1">Transaction Type</label>
                                    <p-select
                                        [options]="transactionTypes"
                                        [(ngModel)]="formModel.type"
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Set transaction type"
                                        name="transactionType"
                                        styleClass="w-full">
                                    </p-select>
                                </div>

                                <hr class="my-4"/>

                                <h3 class="text-lg font-medium mb-2">Category</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-1">Parent Category</label>
                                        <ng-container *ngIf="categoriesLoading; else parentCatSelect">
                                            <p-skeleton height="2rem" styleClass="w-full"></p-skeleton>
                                        </ng-container>
                                        <ng-template #parentCatSelect>
                                            <p-select
                                                [options]="parentCategories"
                                                [(ngModel)]="formModel.parentCategoryId"
                                                (onChange)="onParentCategoryChange()"
                                                optionLabel="name"
                                                optionValue="id"
                                                placeholder="Set parent category"
                                                name="parentCategory"
                                                styleClass="w-full">
                                            </p-select>
                                        </ng-template>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium mb-1">Category</label>
                                        <ng-container *ngIf="childCategoriesLoading; else childCatSelect">
                                            <p-skeleton height="2rem" styleClass="w-full"></p-skeleton>
                                        </ng-container>
                                        <ng-template #childCatSelect>
                                            <p-select
                                                [options]="filteredCategories"
                                                [(ngModel)]="formModel.categoryId"
                                                [disabled]="!formModel.parentCategoryId || filteredCategories.length === 0"
                                                optionLabel="name"
                                                optionValue="id"
                                                placeholder="Set category"
                                                name="category"
                                                styleClass="w-full">
                                            </p-select>
                                        </ng-template>
                                    </div>
                                </div>

                                <hr class="my-4"/>

                                <h3 class="text-lg font-medium mb-2">General</h3>
                                <div class="mb-4">
                                    <label for="name" class="block text-sm font-medium mb-1">Name *</label>
                                    <input id="name" type="text" pInputText [(ngModel)]="formModel.name" name="name"
                                           required/>
                                </div>

                                <div class="mb-4">
                                    <label for="startDate" class="block text-sm font-medium mb-1">Choose a start date
                                        *</label>
                                    <p-date-picker
                                        id="startDate"
                                        [(ngModel)]="formModel.startDate"
                                        name="startDate"
                                        dateFormat="yy/mm/dd"
                                        [showIcon]="true"
                                        required
                                        styleClass="w-full">
                                    </p-date-picker>
                                </div>

                                <div class="flex items-center gap-2 mb-4">
                                    <p-button
                                        label="Set Recurrence Rule"
                                        icon="pi pi-replay"
                                        (onClick)="openRruleModal()"
                                        styleClass="p-button-sm">
                                    </p-button>
                                    <span class="text-sm text-secondary truncate"
                                          [title]="formModel.recurrenceRule || 'Does not repeat'">
                        {{ recurrenceStatus ? 'Repeats: ' + recurrenceStatus : 'Does not repeat' }}
                    </span>
                                </div>

                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-1">Account</label>
                                    <ng-container *ngIf="accountsLoading; else accountSelect">
                                        <p-skeleton height="2rem" styleClass="w-full"></p-skeleton>
                                    </ng-container>
                                    <ng-template #accountSelect>
                                        <p-select
                                            [options]="accounts"
                                            [(ngModel)]="formModel.accountId"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Account"
                                            name="account"
                                            styleClass="w-full">
                                        </p-select>
                                    </ng-template>
                                </div>

                                <div class="flex flex-col gap-3 mb-4">
                                    <div class="flex items-center justify-between">
                                        <label class="text-sm font-medium">Active</label>
                                        <p-toggle-switch [(ngModel)]="formModel.isActive"
                                                         name="isActive"></p-toggle-switch>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <label class="text-sm font-medium">Manual</label>
                                        <p-toggle-switch [(ngModel)]="formModel.isManual"
                                                         name="isManual"></p-toggle-switch>
                                    </div>
                                </div>

                                <hr class="my-4"/>

                                <h3 class="text-lg font-medium mb-2">Transaction Details</h3>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label for="amount" class="block text-sm font-medium mb-1">Amount *</label>
                                        <p-inputNumber
                                            id="amount"
                                            [(ngModel)]="formModel.amount"
                                            name="amount"
                                            mode="decimal"
                                            [minFractionDigits]="2"
                                            [maxFractionDigits]="2"
                                            required
                                            styleClass="w-full">
                                        </p-inputNumber>
                                    </div>

                                    <div>
                                        <label for="currency" class="block text-sm font-medium mb-1">Currency</label>
                                        <ng-container *ngIf="currenciesLoading; else currencySelect">
                                            <p-skeleton height="2rem" styleClass="w-full"></p-skeleton>
                                        </ng-container>
                                        <ng-template #currencySelect>
                                            <p-select
                                                id="currency"
                                                [options]="currencyCodes"
                                                [(ngModel)]="formModel.currency"
                                                placeholder="Currency"
                                                name="currency"
                                                styleClass="w-full">
                                            </p-select>
                                        </ng-template>
                                    </div>
                                </div>

                                <div class="mb-6">
                                    <label for="note" class="block text-sm font-medium mb-1">Note</label>
                                    <textarea id="note" class="w-full"
                                              pInputTextarea [(ngModel)]="formModel.note" name="note"
                                              rows="3"></textarea>
                                </div>

                                <div class="flex justify-end">
                                    <p-button
                                        label="Save Changes"
                                        icon="pi pi-save"
                                        [disabled]="!planForm.valid"
                                        (onClick)="savePlan()">
                                    </p-button>
                                </div>

                            </form>
                        </div>
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <h3 class="text-xl font-semibold mb-4">Planned Payment Plans</h3>

                        <div class="flex flex-column md:flex-row justify-end align-items-center mb-4 gap-3">

                            <div class="p-inputgroup w-full md:w-30rem">
                                <input
                                    type="text"
                                    pInputText
                                    placeholder="Search Planned Payment Plans..."
                                    [(ngModel)]="searchQuery"
                                    (ngModelChange)="onSearchChange()">
                                <button type="button" pButton icon="pi pi-search"
                                        (click)="loadInstallmentPlans()"></button>
                            </div>

                            <!-- Action Buttons: Add Transaction, Filter, and Column Customization -->
                            <div class="flex justify-end items-center gap-3 w-full">
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
                                             <span *ngSwitchCase="'name'"> {{ plannedPayment?.name }} </span>

                                            <span *ngSwitchCase="'account'"> {{ plannedPayment.account?.name }} </span>

                                            <span *ngSwitchCase="'bank'"> {{ plannedPayment.bank?.name }} </span>

                                            <p-tag *ngSwitchCase="'category'" [value]="plannedPayment.category?.name || 'N/A'"></p-tag>

                                            <p-tag *ngSwitchCase="'parentCategory'" [value]="plannedPayment.parentCategory?.name || 'N/A'"></p-tag>

                                            <p-tag *ngSwitchCase="'type'"  [value]="getType(plannedPayment.type)?.displayName || 'Unknown'" [icon]="'pi pi-' + getType(plannedPayment.type)?.icon"></p-tag>

                                            <span *ngSwitchCase="'amount'" [ngClass]="{'text-red-500': plannedPayment.amount?.amount < 0, 'text-green-500': plannedPayment.amount?.amount >= 0}">
                                                {{ plannedPayment.amount?.amount | currency: plannedPayment.amount?.currencyCode }}
                                            </span>

                                            <span *ngSwitchCase="'paidAmount'" [ngClass]="{'text-red-500': plannedPayment.paidAmount?.amount < 0, 'text-green-500': plannedPayment.paidAmount?.amount >= 0}">
                                                {{ plannedPayment.paidAmount?.amount | currency: plannedPayment.paidAmount?.currencyCode }}
                                            </span>

                                            <span *ngSwitchCase="'dueDate'">
                                                {{ plannedPayment.dueDate | date: 'medium' }}
                                            </span>


                                            <span *ngSwitchCase="'createdDate'">
                                                {{ plannedPayment.createdDate | date: 'medium' }}
                                            </span>


                                            <span *ngSwitchCase="'status'">
                                                {{ getStatus(plannedPayment.status) }}
                                            </span>

                                            <span *ngSwitchCase="'actions'">
                                                <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-rounded" (click)="setMenuTarget(plannedPayment); menu.toggle($event)"></button>
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
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>

        <p-dialog
            [(visible)]="displayPaymentModal"
            [header]="paymentModalTitle"
            [modal]="true"
            [resizable]="false"
            [draggable]="false"
            [style]="{width: '400px'}"
            [breakpoints]="{'960px': '80vw', '640px': '90vw'}">


            <div class="row">
                <div class="field mb-4">
                    <label for="amount" class="font-medium block mb-2">Amount *</label>
                    <p-inputNumber
                        inputId="amount"
                        [ngModel]="paymentRequest?.amount ?? 0"
                        (ngModelChange)="paymentRequest.amount = $event || 0"
                        mode="currency"
                        [currency]="selectedFinancePlannedPaymentItem?.amount?.currencyCode || 'USD'"
                        [locale]="'en-US'"
                        class="w-full"
                        [disabled]="isPaymentSubmitting"
                    ></p-inputNumber>
                </div>

                <div class="field mb-4">
                    <label for="transactionName" class="font-medium block mb-2">Transaction Name</label>
                    <input
                        id="transactionName"
                        type="text"
                        pInputText
                        [(ngModel)]="paymentRequest.transactionName"
                        placeholder="e.g., Monthly Installment Payment"
                        [disabled]="isPaymentSubmitting"
                    />
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end gap-3 p-2">
                    <p-button
                        label="Discard"
                        icon="pi pi-times"
                        class="p-button-secondary p-button-text"
                        (click)="displayPaymentModal = false"
                        [disabled]="isPaymentSubmitting">
                    </p-button>
                    <p-button
                        label="Save Changes"
                        icon="pi pi-save"
                        class="p-button-info"
                        (click)="submitPayment()"
                        [loading]="isPaymentSubmitting"
                        [disabled]="paymentRequest.amount <= 0 || !selectedFinancePlannedPaymentItem">
                    </p-button>
                </div>
            </ng-template>

        </p-dialog>
    `,


})
export class InstallmentPlanManagementComponent implements OnInit {

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private dialogService: DialogService,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,


    ) {
    }

    // --- Service Data ---
    // UPDATED: Use the new DTO structure and Enum
    transactionTypes: FinanceTransactionTypeDto[] = FinanceTransactionType.All;

    currencyCodes: string[] = [];
    accounts: FinanceAccount[] = [];
    parentCategories: FinanceCategory[] = [];
    filteredCategories: FinanceCategory[] = [];

    // --- Loading States (Unchanged) ---
    currenciesLoading: boolean = true;
    accountsLoading: boolean = true;
    categoriesLoading: boolean = true;
    childCategoriesLoading: boolean = false;

    // Form Model (UPDATED: property name change)
    formModel: any = {
        type: FinanceTransactionType.All[1].id,
        parentCategoryId: null,
        categoryId: null,
        name: null,
        startDate: new Date(),
        recurrenceRule: null,
        accountId: null,
        isActive: true,
        isManual: false,
        amount: null,
        currency: null,
        note: null,
    };

    // RRULE Models (Unchanged)
    showRecurrenceModal: boolean = false;
    freqOptions = [
        {label: 'Daily', value: Frequency.DAILY}, {label: 'Weekly', value: Frequency.WEEKLY},
        {label: 'Monthly', value: Frequency.MONTHLY}, {label: 'Yearly', value: Frequency.YEARLY},
    ];
    endOptions = [
        {label: 'Count', value: 'count'}, {label: 'Until Date', value: 'until'},
    ];
    rruleForm: RRuleForm = {
        freq: Frequency.MONTHLY, interval: 1, countOrUntil: 'count', count: 12, until: null,
    };

    ref!: DynamicDialogRef<any> | null;

    selectedPlan!: FinancePlannedPayment
    selectedParentCategoryId: string = "null";

    // --- Initialization & Data Loading (Unchanged logic) ---


    plannedPayments: FinancePlannedPaymentItem[] = [];
    totalRecords: number = 0;
    loading: boolean = true;

    // Pagination and Filter State
    rows: number = 10;
    first: number = 0;
    searchQuery: string = '';
    searchTimeout: any;

    // Column Management
    allColumns: Column[] = [
        {field: 'actions', header: "Actions"},
        {field: 'name', header: 'Name'},
        {field: 'account', header: 'Account'},
        {field: 'amount', header: 'Amount'},
        {field: 'paidAmount', header: 'Paid Amount'},
        {field: 'status', header: 'Status'},
        {field: 'bank', header: 'Bank'},
        {field: 'type', header: 'Type'},
        {field: 'category', header: 'Category'},
        {field: 'dueDate', header: 'Due Date'},
        {field: 'parentCategory', header: 'Parent Category'},
        {field: 'createdDate', header: 'Created Date'},
    ];
    selectedColumns: Column[] = [...this.allColumns.slice(0, 6)]; // Default visible columns

    // Skeleton Data (to match the rows being requested)
    skeletonData: any[] = new Array(this.rows).fill({});

    menuItems: MenuItem[] = [];
    selectedFinancePlannedPaymentItem!: FinancePlannedPaymentItem;

    displayPaymentModal: boolean = false;
    isPaymentSubmitting: boolean = false;
    selectedDetailId: string | null = null;
    paymentModalTitle: string = '';

    paymentRequest: PaymentRequest = {
        amount: 0,
        transactionName: '',
        isCompleted: false,
    };

    ngOnInit(): void {

        this.initMenu();

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadCurrencies();
                this.loadAccounts();
                this.loadParentCategories();
                this.getPlan(id);
            }
        });
    }



    getPlan(planId: string): void {
        this._financeService.getFinancePlannedPayment(planId).subscribe({
            next: (plan: FinancePlannedPayment) => {
                this.selectedPlan = plan;
                this.patchFormModel(plan);
                this.loadInstallmentPlans();
            },
            error: (err) => {
                console.error('Error loading plan details:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data Error',
                    detail: 'Failed to load plan details for editing.'
                });
                // this.showDetailDialog = false;
                // this.initialLoading = false;
            }
        });
    }

    private patchFormModel(plan: FinancePlannedPayment): void {

        this.formModel = {
            id: plan.id,
            type: plan.type,
            parentCategoryId: plan.parentCategory?.id,
            categoryId: plan.category?.id,
            name: plan.name,
            startDate: new Date(plan.startDate ?? ""),
            recurrenceRule: plan.recurrenceRule,
            accountId: plan.account?.id,
            isActive: plan.isActive,
            isManual: plan.isManual,
            amount: plan.amount?.amount,
            currency: plan.amount?.currencyCode,
            note: plan.note,
        };

        if (plan?.parentCategory?.id) {
            this.onParentCategoryChange(false);
        }
        // Load child categories and then update end value
        this._updateEndValue();

    }

    private loadCurrencies(): void {
        this.currenciesLoading = true;
        this._financeService.getCurrencyCodes().subscribe({
            next: (response: any) => {
                this.currencyCodes = response.payload.map((x: any) => x.code);
                if (this.currencyCodes.length > 0) {
                    this.formModel.currency = this.currencyCodes[0];
                }
                this.currenciesLoading = false;
            },
            error: (err) => {
                console.error('Error loading currencies:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data Error',
                    detail: 'Failed to load currency codes.'
                });
                this.currenciesLoading = false;
            }
        });
    }

    private loadAccounts(): void {
        this.accountsLoading = true;
        this._financeService.getFinanceAccounts().subscribe({
            next: (response: any) => {
                this.accounts = response;
                this.accountsLoading = false;
            },
            error: (err) => {
                console.error('Error loading accounts:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data Error',
                    detail: 'Failed to load finance accounts.'
                });
                this.accountsLoading = false;
            }
        });
    }

    private loadParentCategories(): void {
        this.categoriesLoading = true;
        this._financeService.getFinanceParentCategories().subscribe({
            next: (response: any) => {
                this.parentCategories = response;
                this.categoriesLoading = false;
            },
            error: (err) => {
                console.error('Error loading parent categories:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Data Error',
                    detail: 'Failed to load parent categories.'
                });
                this.categoriesLoading = false;
            }
        });
    }

    // --- Category Cascading Logic (Unchanged logic) ---
    onParentCategoryChange(change: boolean = true): void {
        debugger;

        if (change) {
            this.formModel.categoryId = null;
        }

        this.filteredCategories = [];

        const parentId = this.formModel.parentCategoryId ?? "";

        if (parentId) {
            this.childCategoriesLoading = true;
            this._financeService.getFinanceCategories(1, 10000, parentId).subscribe({
                next: (response: any) => {
                    this.filteredCategories = response.data;
                    this.childCategoriesLoading = false;
                },
                error: (err) => {
                    console.error('Error loading child categories:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Data Error',
                        detail: 'Failed to load sub-categories.'
                    });
                    this.childCategoriesLoading = false;
                }
            });
        }
    }

    // --- RRULE Logic (Unchanged logic) ---
    openRruleModal(): void {

        const eventData = {
            // This is the data originally passed via MAT_DIALOG_DATA, now DynamicDialogConfig
            event: {
                start: this.formModel.startDate,
                recurrence: this.formModel.recurrenceRule
            },
            // Assuming the weekdays array is fetched elsewhere or provided
            weekdays: [
                {abbr: 'Su', label: 'Sunday', value: 'SU'},
                {abbr: 'Mo', label: 'Monday', value: 'MO'},
                // ... all 7 days
            ]
        };

        // 2. Open the dynamic dialog using the DialogService
        this.ref = this.dialogService.open(CalendarRecurrenceComponent, {
            header: 'Recurrence Rule Setup',
            width: '400px', // Set appropriate size
            // Pass the data using 'data' property
            data: eventData
        });

        // 3. Subscribe to the dialog close event to get the result
        this.ref?.onClose.subscribe((result: any) => {
            if (result && result.recurrence === 'cleared') {
                this.formModel.recurrenceRule = null;
            } else if (result && result.recurrence) {
                this.formModel.recurrenceRule = result.recurrence;
            }

            this._updateEndValue();
        });

    }

    // --- Form Submission (Updated Payload) ---
    savePlan(): void {
        if (this.formModel.amount === null || this.formModel.amount <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Amount must be greater than zero.'
            });
            return;
        }


        // 1. Structure the Payload for the API (Uses transactionTypeCode)
        const payload = {
            name: this.formModel.name,
            amount: this.formModel.amount,
            currencyCode: this.formModel.currency,
            note: this.formModel.note,
            isActive: this.formModel.isActive,
            isManual: this.formModel.isManual,
            type: this.formModel.type,
            startDate: this.formModel.startDate ? this.formModel.startDate.toISOString().split('T')[0] : null,
            recurrenceRule: this.formModel.recurrenceRule,
            account: this.formModel.accountId ? this.accounts.find(x => x.id == this.formModel.accountId) : null,
            category: this.formModel.categoryId ? this.filteredCategories.find(x => x.id == this.formModel.categoryId) : null,
            end: this.formModel.end
        };

        // 2. Call the Service
        this._financeService.updatePlannedPayment(this.selectedPlan.id ?? "", payload).subscribe({
            next: (response: any) => {
                // SUCCESS
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Installment plan '${this.formModel.name}' created successfully.`
                });

                this.getPlan(this.selectedPlan.id ?? "");

            },
            error: (err) => {
                // ERROR
                console.error('Installment creation failed:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Creation Failed',
                    detail: err.error?.message || 'Could not create installment plan due to a server error.'
                });
            }
        });
    }


    get recurrenceStatus(): string | null {
        const recurrence = this.formModel.recurrenceRule;

        // Return null, if there is no recurrence on the event
        if (!recurrence) {
            return null;
        }

        try {
            // Convert the recurrence rule to text
            let ruleText = RRule.fromString(recurrence).toText();

            // Capitalize the first letter
            ruleText = ruleText.charAt(0).toUpperCase() + ruleText.slice(1);

            return ruleText;
        } catch (e) {
            console.error("Error converting RRULE to text:", e);
            this.messageService.add({
                severity: 'error',
                summary: 'Recurrence Error',
                detail: 'Invalid recurrence rule format.'
            });
            return 'Invalid Rule';
        }
    }


    private _updateEndValue(): void {
        // Get the event recurrence
        const recurrence = this.formModel.recurrenceRule as string;

        // Return if this is a non-recurring event
        if (!recurrence) {
            return;
        }

        // Parse the recurrence rule
        const parsedRules: any = {};
        recurrence.split(';').forEach((rule) => {

            // Split the rule
            const parsedRule = rule.split('=');

            // Add the rule to the parsed rules
            parsedRules[parsedRule[0]] = parsedRule[1];
        });

        // If there is an UNTIL rule...
        if (parsedRules['UNTIL']) {
            // Use that to set the end date
            this.formModel.end = parsedRules['UNTIL'];
            // Return
            return;
        }

        // If there is a COUNT rule...
        if (parsedRules['COUNT']) {
            // Generate the RRule string
            const rrule = 'DTSTART=' + moment(this.formModel.startDate.value).utc().format('YYYYMMDD[T]HHmmss[Z]') + '\nRRULE:' + recurrence;

            // Use RRule string to generate dates
            const dates = RRule.fromString(rrule).all();

            // Get the last date from dates array and set that as the end date
            this.formModel.end = moment(dates[dates.length - 1]).toISOString();

            // Return
            return;
        }
        this.formModel.end = moment().year(9999).endOf('year').toISOString();
    }


    getSeverity(bank: FinancePlannedPayment) {
        return bank.isActive ? 'success' : 'danger';
    }
    getManual(bank: FinancePlannedPayment) {
        return bank.isManual ? 'danger' : 'success';
    }

    initMenu() {
        this.menuItems = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Delete',
                        icon: 'pi pi-trash',
                        styleClass: 'text-red-500',
                        command: () => this.delete(this.selectedFinancePlannedPaymentItem)
                    },
                    {
                        label: 'Complete',
                        icon: 'pi pi-check',
                        styleClass: 'text-red-500',
                        command: () => this.showPaymentModal(this.selectedFinancePlannedPaymentItem)
                    }
                ]
            }
        ];
    }

    loadInstallmentPlans(sortField: string = '', sortOrder: number = 1): void {

        if(this.selectedPlan?.id){
            this.loading = true;
            this.skeletonData = new Array(this.rows).fill({});

            const pageNumber = Math.floor(this.first / this.rows) + 1;

            const filter: FinancePlannedPaymentItemSearchFilter = {
                search: {
                    value: this.searchQuery
                },
                paginationFilter: {
                    pageNumber: pageNumber,
                    pageSize: this.rows
                },
                filter: {
                    financePlannedPaymentId : this.selectedPlan.id ?? ""
                }
            };

            this._financeService.searchFinancePlannedPaymentItems(filter).subscribe({
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
        }

    }

    setMenuTarget(financePlannedPaymentItem: FinancePlannedPaymentItem) {
        this.selectedFinancePlannedPaymentItem = financePlannedPaymentItem;
    }

    delete(plannedPayment: FinancePlannedPaymentItem) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the planned payment item whose name is ${plannedPayment?.name}?`,
            header: 'Confirm Planned Payment',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deletePlannedPaymentItem(plannedPayment);
            },
            reject: () => {
                this.messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    deletePlannedPaymentItem(plannedPayment: FinancePlannedPaymentItem) {
        this._financeService.deletePlannedPaymentItem(this.selectedPlan.id ?? "",plannedPayment?.id ?? "")
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Deleted',
                        detail: `The planned payment item has been successfully deleted.`
                    });

                    this.loadInstallmentPlans();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Failed to delete planned payment item.`
                    });
                }
            });
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

    getType(typeId: number | undefined): FinanceTransactionTypeDto | undefined {
        if (typeId === undefined) return undefined;
        return FinanceTransactionType.All.find(t => t.id === typeId);
    }

    getStatus(status: number){
        let itemStatus = FinancePlannedPaymentItemStatus.All.find(x=>x.id === status)?.displayName;
        return itemStatus;
    }

    submitPayment(): void {
        if (!this.selectedFinancePlannedPaymentItem.id || this.paymentRequest.amount <= 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid plan or installment details for payment.' });
            return;
        }

        this.isPaymentSubmitting = true;

        this._financeService.markAsCompletedPlannedPaymentItem(
            this.selectedPlan.id ?? "",
            this.selectedFinancePlannedPaymentItem.id ?? "",
            this.paymentRequest
        ).subscribe({
            next: (response: any) => {
                this.messageService.add({ severity: 'success', summary: 'Payment Success', detail: 'Installment payment recorded successfully.' });
                this.isPaymentSubmitting = false;
                this.displayPaymentModal = false;

                this.loadInstallmentPlans();

                this.cdr.detectChanges();

            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Payment Failed', detail: err?.error?.message || 'Could not process payment.' });
                this.isPaymentSubmitting = false;
            }
        });
    }

    showPaymentModal(detail: FinancePlannedPaymentItem): void {
        this.paymentRequest.amount = detail.amount?.amount || 0;
        this.paymentRequest.transactionName = '';
        this.paymentRequest.isCompleted = true;
        this.paymentModalTitle = `Pay ${detail.amount?.amount} ${detail.amount?.currencyCode}`;
        this.displayPaymentModal = true;
    }
}
