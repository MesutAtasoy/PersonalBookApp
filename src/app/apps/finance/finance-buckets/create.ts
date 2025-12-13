import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // <-- Import ActivatedRoute
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";

// Assuming PersonalFinanceService and FinanceAccount are defined elsewhere
import { PersonalFinanceService } from "@/apps/finance/finance.service";
import { FinanceAccount } from "@/apps/finance/finance.types";

// --- 1. INTERFACE DEFINITIONS ---
export interface FinanceBucket {
    id: string | null; // ID must be present for update mode
    // Basic Information
    accountId: string | null;
    month: string | null;
    year: number | null;
    startDate: Date | null;
    endDate: Date | null;

    // Forecast Information
    expectedIncomeAmount: number | null;
    expectedExpenseAmount: number | null;
    expectedTransferAmount: number | null;
    expectedCreditCardPaymentAmount: number | null;
    expectedCreditAmount: number | null;
}

// --- 2. COMPONENT DEFINITION ---

@Component({
    selector: 'app-finance-add-bucket',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        InputNumberModule, ToastModule, SelectModule,
        DatePickerModule, SkeletonModule, DividerModule
    ],
    template: `
        <div class="p-4 card">
            <p-toast></p-toast>

            <h2 class="text-2xl font-semibold mb-4">
                💰 {{ isUpdateMode ? 'Update Existing Bucket' : 'Create New Bucket' }}
            </h2>

            <div class="row">

                <div class="col-12">
                    <h3 class="text-lg font-medium mb-3 block">Basic information</h3>
                    <p class="text-sm text-500 mb-4">Set bucket general information providing month, year, start and end dates.</p>
                </div>

                <div class="field col-12 mb-4">
                    <label for="accountId" class="block text-sm font-medium mb-1 block">Account *</label>
                    <p-skeleton *ngIf="accountLoading || bucketLoading" height="2.2rem"></p-skeleton>
                    <p-select
                        *ngIf="!accountLoading && !bucketLoading"
                        [options]="accounts"
                        [(ngModel)]="bucket.accountId"
                        optionLabel="name"
                        optionValue="id"
                        [filter]="true"
                        placeholder="Select Account"
                        name="accountId"
                        required>
                    </p-select>
                </div>

                <div class="field col-12 md:col-6">
                    <label for="month" class="block">Month *</label>
                    <input
                        *ngIf="!bucketLoading"
                        id="month"
                        type="text"
                        pInputText
                        [(ngModel)]="bucket.month"
                        name="month"
                        placeholder=""
                        required
                    />
                    <p-skeleton *ngIf="bucketLoading" height="2.2rem"></p-skeleton>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="year" class="block">Year *</label>
                    <p-inputNumber
                        *ngIf="!bucketLoading"
                        id="year"
                        [useGrouping]="false"
                        mode="decimal"
                        [(ngModel)]="bucket.year"
                        name="year"
                        placeholder=""
                        required
                    ></p-inputNumber>
                    <p-skeleton *ngIf="bucketLoading" height="2.2rem"></p-skeleton>
                </div>

                <div class="field col-12 md:col-6">
                    <label for="startDate" class="block">Choose a start date *</label>
                    <p-date-picker
                        *ngIf="!bucketLoading"
                        id="startDate"
                        [(ngModel)]="bucket.startDate"
                        name="startDate"
                        dateFormat="dd/mm/yy"
                        [showIcon]="true"
                        required
                    ></p-date-picker>
                    <p-skeleton *ngIf="bucketLoading" height="2.2rem"></p-skeleton>
                </div>
                <div class="field col-12 md:col-6">
                    <label for="endDate" class="block">Choose a end date *</label>
                    <p-date-picker
                        *ngIf="!bucketLoading"
                        id="endDate"
                        [(ngModel)]="bucket.endDate"
                        name="endDate"
                        dateFormat="dd/mm/yy"
                        [showIcon]="true"
                        required
                    ></p-date-picker>
                    <p-skeleton *ngIf="bucketLoading" height="2.2rem"></p-skeleton>
                </div>

                <p-divider></p-divider>

                <div class="col-12">
                    <h3 class="text-lg font-medium mb-3">Forecast information</h3>
                    <p class="text-sm text-500 mb-4">Set forecast for giving period.</p>
                </div>

                <ng-container *ngIf="!bucketLoading">
                    <div class="field col-12">
                        <label for="expectedIncomeAmount" class="block">Expected Income Amount *</label>
                        <p-inputNumber
                            id="expectedIncomeAmount"
                            [(ngModel)]="bucket.expectedIncomeAmount"
                            mode="currency"
                            currency="TRY"
                            locale="tr-TR"
                            name="expectedIncomeAmount"
                            required>
                        </p-inputNumber>
                    </div>
                    <div class="field col-12">
                        <label for="expectedExpenseAmount" class="block">Expected Expense Amount *</label>
                        <p-inputNumber
                            id="expectedExpenseAmount"
                            [(ngModel)]="bucket.expectedExpenseAmount"
                            mode="currency"
                            currency="TRY"
                            locale="tr-TR"
                            name="expectedExpenseAmount"
                            required>
                        </p-inputNumber>
                    </div>
                    <div class="field col-12">
                        <label for="expectedTransferAmount" class="block">Expected Transfer Amount *</label>
                        <p-inputNumber
                            id="expectedTransferAmount"
                            [(ngModel)]="bucket.expectedTransferAmount"
                            mode="currency"
                            currency="TRY"
                            locale="tr-TR"
                            name="expectedTransferAmount"
                            required>
                        </p-inputNumber>
                    </div>
                    <div class="field col-12">
                        <label for="expectedCreditCardPaymentAmount" class="block">Expected Credit Card Payment Amount *</label>
                        <p-inputNumber
                            id="expectedCreditCardPaymentAmount"
                            [(ngModel)]="bucket.expectedCreditCardPaymentAmount"
                            mode="currency"
                            currency="TRY"
                            locale="tr-TR"
                            name="expectedCreditCardPaymentAmount"
                            required>
                        </p-inputNumber>
                    </div>
                    <div class="field col-12">
                        <label for="expectedCreditAmount" class="block">Expected Credit Amount *</label>
                        <p-inputNumber
                            id="expectedCreditAmount"
                            [(ngModel)]="bucket.expectedCreditAmount"
                            mode="currency"
                            currency="TRY"
                            locale="tr-TR"
                            name="expectedCreditAmount"
                            required>
                        </p-inputNumber>
                    </div>
                </ng-container>

                <ng-container *ngIf="bucketLoading">
                    <div class="field col-12" *ngFor="let i of [1,2,3,4,5]">
                        <p-skeleton height="2.2rem"></p-skeleton>
                    </div>
                </ng-container>


            </div>

            <div class="flex justify-end gap-2 mt-5 pt-3 border-top-1 border-gray-200">
                <p-button label="Cancel" icon="pi pi-times" (onClick)="cancel()" styleClass="p-button-text p-button-danger"></p-button>
                <p-button [label]="isUpdateMode ? 'Update' : 'Save'" icon="pi pi-check" (onClick)="saveBucket()" styleClass="p-button-success"></p-button>
            </div>
        </div>
    `
})
export class FinanceAddBucketComponent implements OnInit {

    // --- Data State ---
    bucket!: any;
    accounts: FinanceAccount[] = [];
    bucketIdFromRoute: string | null = null; // Stores the ID found in the URL

    // --- UI State ---
    accountLoading: boolean = true;
    bucketLoading: boolean = false; // New flag for loading existing bucket data
    isUpdateMode: boolean = false;

    constructor(
        private _financeService: PersonalFinanceService,
        private messageService: MessageService,
        private route: ActivatedRoute // <-- Inject ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.checkRouteForId();
        this.loadAccounts();
    }

    /**
     * Checks the URL parameters for an existing bucket ID.
     */
    checkRouteForId(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.bucketIdFromRoute = id;
                this.isUpdateMode = true;
                this.loadBucketData(id);
            } else {
                // Initialize for Create Mode immediately if no ID is found
                this.bucket = this.getEmptyBucket();
                this.isUpdateMode = false;
            }
        });
    }

    /**
     * Loads existing bucket data when in Update Mode.
     */
    loadBucketData(id: string): void {
        this.bucketLoading = true;
        // ASSUMING THIS METHOD EXISTS in PersonalFinanceService
        this._financeService.getBucket(id).subscribe({
            next: (data : any) => {
                // Ensure dates are converted to Date objects if they come back as strings
                data.startDate = data.startDate ? new Date(data.startDate) : null;
                data.endDate = data.endDate ? new Date(data.endDate) : null;

                this.bucket = data;
                this.bucket.accountId = data.account?.id;
                this.bucket.expectedCreditAmount = data.expectedCreditAmount?.amount;
                this.bucket.expectedExpenseAmount = data.expectedExpenseAmount?.amount;
                this.bucket.expectedIncomeAmount = data.expectedIncomeAmount?.amount;
                this.bucket.expectedCreditCardPaymentAmount = data.expectedCreditCardPaymentAmount?.amount;
                this.bucket.expectedTransferAmount = data.expectedTransferAmount?.amount;

                this.bucketLoading = false;
            },
            error: (err) => {
                this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load existing bucket data.'});
                this.bucketLoading = false;
                // Fallback to empty bucket if loading fails
                this.bucket = this.getEmptyBucket();
            }
        });
    }

    /**
     * Initializes an empty Bucket object with default values.
     */
    getEmptyBucket(): FinanceBucket {
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);

        return {
            id: null,
            accountId: null,
            month: null,
            year: currentDate.getFullYear(),
            startDate: currentDate,
            endDate: nextMonthDate,
            expectedIncomeAmount: 0,
            expectedExpenseAmount: 0,
            expectedTransferAmount: 0,
            expectedCreditCardPaymentAmount: 0,
            expectedCreditAmount: 0,
        };
    }

    // -------------------------------------------------------------------------
    // D A T A   L O A D I N G (ACCOUNTS)
    // -------------------------------------------------------------------------

    loadAccounts(): void {
        this.accountLoading = true;

        this._financeService.getFinanceAccounts()
            .subscribe({
                next: (data) => {
                    this.accounts = data;
                    this.accountLoading = false;
                },
                error: (err) => {
                    this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load accounts.'});
                    this.accountLoading = false;
                }
            })
    }

    // -------------------------------------------------------------------------
    // S A V E (UPSERT LOGIC)
    // -------------------------------------------------------------------------

    saveBucket(): void {

        // --- 1. Validation for Required Fields ---
        if (!this.bucket.accountId || !this.bucket.month || !this.bucket.year || !this.bucket.startDate || !this.bucket.endDate) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Failed',
                detail: 'Please fill in all required fields (Account, Month, Year, Dates).'
            });
            return;
        }

        // --- 2. Prepare Payload ---
        // Ensure bucket ID is correctly set in the payload if updating
        let payload: any = {
            ...this.bucket,
            id: this.isUpdateMode ? this.bucketIdFromRoute : null,
        };

        // Lookup account details
        const account = this.accounts.find(x => x.id === this.bucket.accountId);

        if (!account) {
            this.messageService.add({severity: 'error', summary: 'Error', detail: 'Selected account details are missing.'});
            return;
        }

        payload.account = {
            id: account.id,
            name: account.name,
            currencyCode: account.currencyCode
        };

        // Ensure these arrays exist for the service call, even if empty
        payload.incomes = [];
        payload.expenses = [];

        // --- 3. Call Service (INSERT or UPDATE) ---

        const saveOperation = this.isUpdateMode
            ? this._financeService.updateBucket(this.bucket.id ?? "", payload) // ASSUMES updateBucket exists
            : this._financeService.addBucket(payload);

        saveOperation.subscribe({
            next: (response) => {
                const action = this.isUpdateMode ? 'updated' : 'saved';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Bucket ${action} successfully.`
                });

                if (!this.isUpdateMode) {
                    this.bucket = this.getEmptyBucket(); // Reset for new entry
                }
            },
            error: (err) => {
                console.error(`Failed to ${this.isUpdateMode ? 'update' : 'save'} Bucket:`, err);
                this.messageService.add({severity: 'error', summary: 'Error', detail: `Failed to ${this.isUpdateMode ? 'update' : 'save'} Bucket.`});
            }
        });
    }

    cancel(): void {
        // Reset the form based on mode
        if (this.isUpdateMode) {
            // Reload the original data from the service if possible, or just reset the form model
            this.loadBucketData(this.bucketIdFromRoute!);
        } else {
            this.bucket = this.getEmptyBucket(); // Reset to empty for create mode
        }

        this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Form reset.'
        });
    }
}
