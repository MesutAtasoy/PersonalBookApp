import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RRule, Frequency } from 'rrule';
import { PersonalFinanceService } from "@/apps/finance/finance.service";
import {DatePickerModule} from "primeng/datepicker";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {TextareaModule} from "primeng/textarea";
import {
    FinanceAccount,
    FinanceCategory,
    FinanceTransactionType,
    FinanceTransactionTypeDto
} from "@/apps/finance/finance.types";
import {
    CalendarRecurrenceComponent,
} from "@/apps/finance/planned-payments/recurrence-dialog.component";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import moment from "moment";

interface RRuleForm {
    freq: Frequency;
    interval: number;
    countOrUntil: 'count' | 'until';
    count: number | null;
    until: Date | null;
}
// --- END TYPE DEFINITIONS ---

@Component({
    selector: 'app-add-installment-plan',
    standalone: true,
    providers: [MessageService, DialogService],
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
    ],
    template: `
        <div class="card p-4">
            <p-toast></p-toast>

            <h2 class="text-2xl font-semibold mb-4">💰 Add Installment Plan</h2>

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
                    <input id="name" type="text" pInputText [(ngModel)]="formModel.name" name="name" required />
                </div>

                <div class="mb-4">
                    <label for="startDate" class="block text-sm font-medium mb-1">Choose a start date *</label>
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
                    <span class="text-sm text-secondary truncate" [title]="formModel.recurrenceRule || 'Does not repeat'">
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
                        <p-toggle-switch [(ngModel)]="formModel.isActive" name="isActive"></p-toggle-switch>
                    </div>
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium">Manual</label>
                        <p-toggle-switch [(ngModel)]="formModel.isManual" name="isManual"></p-toggle-switch>
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
                    <textarea id="note"  class="w-full"
                              pInputTextarea [(ngModel)]="formModel.note" name="note" rows="3"></textarea>
                </div>

                <p-button
                    label="Create Installment Plan"
                    icon="pi pi-save"
                    [disabled]="!planForm.valid"
                    (onClick)="savePlan()">
                </p-button>
            </form>
        </div>
    `,


})
export class CreateInstallmentPlanComponent implements OnInit {

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private dialogService: DialogService
    ) {}

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
        // Use the code of the default type (e.g., 'EXPENSE')
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
        { label: 'Daily', value: Frequency.DAILY }, { label: 'Weekly', value: Frequency.WEEKLY },
        { label: 'Monthly', value: Frequency.MONTHLY }, { label: 'Yearly', value: Frequency.YEARLY },
    ];
    endOptions = [
        { label: 'Count', value: 'count' }, { label: 'Until Date', value: 'until' },
    ];
    rruleForm: RRuleForm = {
        freq: Frequency.MONTHLY, interval: 1, countOrUntil: 'count', count: 12, until: null,
    };

    ref!: DynamicDialogRef<any> | null;


    // --- Initialization & Data Loading (Unchanged logic) ---
    ngOnInit(): void {
        this.loadCurrencies();
        this.loadAccounts();
        this.loadParentCategories();
    }

    private loadCurrencies(): void {
        this.currenciesLoading = true;
        this._financeService.getCurrencyCodes().subscribe({
            next: (response: any) => {
                this.currencyCodes = response.payload.map((x: any)=>x.code);
                if (this.currencyCodes.length > 0) {
                    this.formModel.currency = this.currencyCodes[0];
                }
                this.currenciesLoading = false;
            },
            error: (err) => {
                console.error('Error loading currencies:', err);
                this.messageService.add({ severity: 'error', summary: 'Data Error', detail: 'Failed to load currency codes.' });
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
                this.messageService.add({ severity: 'error', summary: 'Data Error', detail: 'Failed to load finance accounts.' });
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
                this.messageService.add({ severity: 'error', summary: 'Data Error', detail: 'Failed to load parent categories.' });
                this.categoriesLoading = false;
            }
        });
    }

    // --- Category Cascading Logic (Unchanged logic) ---
    onParentCategoryChange(): void {
        this.formModel.categoryId = null;
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
                    this.messageService.add({ severity: 'error', summary: 'Data Error', detail: 'Failed to load sub-categories.' });
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
                    { abbr: 'Su', label: 'Sunday', value: 'SU' },
                    { abbr: 'Mo', label: 'Monday', value: 'MO' },
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
                }
                else if (result && result.recurrence) {
                    this.formModel.recurrenceRule = result.recurrence;
                }

                this._updateEndValue();
            });

    }

    // --- Form Submission (Updated Payload) ---
    savePlan(): void {
        if (this.formModel.amount === null || this.formModel.amount <= 0) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Amount must be greater than zero.' });
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
        this._financeService.createPlannedPayment(payload).subscribe({
            next: (response: any) => {
                // SUCCESS
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Installment plan '${this.formModel.name}' created successfully.` });

                // Reset form after success
                this.formModel = {
                    // Use the code of the default type (e.g., 'EXPENSE')
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
            this.messageService.add({ severity: 'error', summary: 'Recurrence Error', detail: 'Invalid recurrence rule format.' });
            return 'Invalid Rule';
        }
    }

    /**
     * Handles the RRULE output from the child component.
     * @param rule The generated RRULE string or null if cleared.
     */
    onRruleApplied(rule: string | null): void {
        this.formModel.recurrenceRule = rule;
        // The child component handles closing itself or we use the (onClose) binding in the template.
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
}
