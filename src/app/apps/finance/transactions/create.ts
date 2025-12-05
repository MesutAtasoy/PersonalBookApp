import {Component, OnInit, inject, signal, computed, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable, of, forkJoin, map} from 'rxjs';
import {delay} from 'rxjs/operators';
import {ChangeDetectionStrategy} from '@angular/core';

// --- MOCK AND REQUIRED IMPORTS (Assuming PrimeNG modules are available) ---
import {CardModule} from 'primeng/card';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {SkeletonModule} from 'primeng/skeleton';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {SelectModule} from "primeng/select";
import {DatePickerModule} from "primeng/datepicker";
import {TextareaModule} from "primeng/textarea";
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {
    FinanceAccount, FinanceAccountType, FinanceBucket,
    FinanceCategory,
    FinanceTransactionType,
    FinanceTransactionTypeDto
} from "@/apps/finance/finance.types";
import {Router} from "@angular/router";


@Component({
    selector: 'app-transaction-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        SelectModule,
        DatePickerModule,
        InputNumberModule,
        InputTextModule,
        TextareaModule,
        ButtonModule,
        SkeletonModule,
        ToastModule,
    ],
    // Provide the mock service
    providers: [MessageService, PersonalFinanceService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="surface-ground min-h-screen p-4 flex justify-content-center">
            <p-toast></p-toast>

            <div class="w-full">

                <!-- Header & Buttons -->
                <div class="flex justify-between align-items-center mb-4 sticky top-0 bg-surface-ground z-1 p-2 pt-4">
                    <div>
                        <h1 class="text-3xl font-bold text-900 m-0">Add New Transaction</h1>
                        <p class="text-600 mt-1">Define the type and details of the financial activity.</p>
                    </div>
                    <div class="flex gap-2">
                        <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-text p-button-secondary"
                                  (onClick)="close()"></p-button>
                        <p-button label="Save" icon="pi pi-check" (onClick)="save(false)" [loading]="saving()"
                                  [disabled]="loading() || transactionForm.invalid"></p-button>
                        <p-button label="Save & New" icon="pi pi-save" styleClass="p-button-primary"
                                  (onClick)="save(true)" [loading]="saving()"
                                  [disabled]="loading() || transactionForm.invalid"></p-button>
                    </div>
                </div>

                <!-- Main Card -->
                <p-card styleClass="shadow-2 border-round-xl">

                    <div *ngIf="loading()">
                        <p-skeleton height="2rem" class="mb-2"></p-skeleton>
                        <p-skeleton height="10rem"></p-skeleton>
                        <p-skeleton height="2rem" class="mt-2"></p-skeleton>
                    </div>

                    <!-- Form View -->
                    <form [formGroup]="transactionForm" *ngIf="!loading()">
                        <div class="row gap-y-4">

                            <div class="p-4">
                                <h2 class="text-2xl font-bold text-900">Transaction Type</h2>
                                <p class="text-secondary">Specify transaction type</p>
                            </div>
                            <!-- 1. Transaction Type (Always visible) -->
                            <div class="col-12 mt-4">
                                <label for="type" class="font-semibold text-900 mb-2 block">Transaction Type <span
                                    class="text-red-500">*</span></label>
                                <p-select
                                    inputId="type"
                                    [options]="transactionTypes"
                                    formControlName="type"
                                    optionLabel="displayName"
                                    optionValue="id"
                                    placeholder="Select Transaction Type"
                                    (onChange)="onTypeChange($event.value)"
                                    [showClear]="true"
                                    styleClass="w-full">
                                    <ng-template pTemplate="selectedItem" let-selectedOption>
                                        <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                                            <i [class]="selectedOption.icon"></i>
                                            <div>{{ selectedOption.displayName }}</div>
                                        </div>
                                    </ng-template>
                                    <ng-template let-type pTemplate="item">
                                        <div class="flex align-items-center gap-2">
                                            <i [class]="type.icon"></i>
                                            <div>{{ type.displayName }}</div>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </div>

                            <div class="col-12 mt-4">
                                <hr class="my-3 surface-border">
                            </div>

                            <!-- 2. Accounts and Categories Section -->
                            <div class="p-4">
                                <h2 class="text-2xl font-bold text-900">Accounts & Categories</h2>
                                <p class="text-secondary">Select account and category</p>
                            </div>
                            <!-- Category Section (Cascaded: Primary and Sub-Category) -->
                            <ng-container *ngIf="showCategory()">
                                <div class="mt-4 col-12 md:col-6">
                                    <label for="parentCategory" class="font-semibold text-900 mb-2 block">Primary
                                        Category <span class="text-red-500">*</span></label>
                                    <p-select
                                        inputId="parentCategory"
                                        [options]="parentCategories()"
                                        formControlName="parentCategory"
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Select Primary Category"
                                        (onChange)="onParentCategoryChange($event.value)"
                                        [filter]="true"
                                        styleClass="w-full">
                                    </p-select>
                                </div>
                                <div class="mt-4 col-12 md:col-6">
                                    <label for="category" class="font-semibold text-900 mb-2 block">Sub-Category <span
                                        class="text-red-500">*</span></label>
                                    <p-select
                                        inputId="category"
                                        [options]="childCategories()"
                                        formControlName="category"
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Select Sub-Category"
                                        [disabled]="!childCategories().length"
                                        emptyMessage="Select a primary category first"
                                        [filter]="true"
                                        styleClass="w-full">
                                    </p-select>
                                </div>
                            </ng-container>

                            <!-- Source Account (Required for all types) -->
                            <div class="col-12 md:col-6 mt-4">
                                <label for="fromAccount"
                                       class="font-semibold text-900 mb-2 block">{{ fromAccountLabel() }} <span
                                    class="text-red-500">*</span></label>
                                <p-select
                                    inputId="fromAccount"
                                    [options]="allAccounts()"
                                    formControlName="fromAccount"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Select Account"
                                    (onChange)="onFromAccountChange($event.value)"
                                    [filter]="true"
                                    styleClass="w-full">
                                    <ng-template let-acc pTemplate="item">
                                        <div class="flex align-items-center justify-content-between w-full">
                                            <span>{{ acc.name }}</span>
                                            <span class="text-sm text-500">({{ acc.currencyCode }})</span>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </div>

                            <!-- Destination Account (Required for Transfer, Credit Payment, Loan) -->
                            <div class="col-12 md:col-6 mt-4" *ngIf="showToAccount()">
                                <label for="toAccount" class="font-semibold text-900 mb-2 block">{{ toAccountLabel() }}
                                    <span class="text-red-500">*</span></label>
                                <p-select
                                    inputId="toAccount"
                                    [options]="toAccounts()"
                                    formControlName="toAccount"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Select Destination"
                                    [filter]="true"
                                    styleClass="w-full">
                                    <ng-template let-acc pTemplate="item">
                                        <div class="flex align-items-center justify-content-between w-full">
                                            <span>{{ acc.name }}</span>
                                            <span class="text-sm text-500">({{ acc.currencyCode }})</span>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </div>

                            <!-- Bucket (Optional for all types) -->
                            <div class="col-12 md:col-6 mt-4">
                                <label for="bucket" class="font-semibold text-900 mb-2 block">Bucket</label>
                                <p-select
                                    inputId="bucket"
                                    [options]="buckets()"
                                    formControlName="bucket"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Select Bucket (Optional)"
                                    [showClear]="true"
                                    styleClass="w-full">
                                </p-select>
                            </div>

                            <div class="col-12 mt-4">
                                <hr class="my-3 surface-border">
                            </div>

                            <!-- 3. Amount and Details Section -->
                            <div class="p-4">
                                <h2 class="text-2xl font-bold text-900">Amounts & Details</h2>
                                <p class="text-secondary">Specify amount, note</p>
                            </div>
                            <!-- Amount (Always visible) -->
                            <div class="col-12 mt-4 md:col-6 lg:col-4">
                                <label for="amount" class="font-semibold text-900 mb-2 block">Amount <span
                                    class="text-red-500">*</span></label>
                                <p-inputNumber
                                    inputId="amount"
                                    formControlName="amount"
                                    mode="currency"
                                    [currency]="selectedCurrency()"
                                    locale="en-US"
                                    [minFractionDigits]="2"
                                    placeholder="0.00"
                                    styleClass="w-full">
                                </p-inputNumber>
                            </div>

                            <!-- Transaction Date (Always visible) -->
                            <div class="col-12 mt-4 md:col-6 lg:col-4">
                                <label for="transactionDate" class="font-semibold text-900 mb-2 block">Transaction Date
                                    <span class="text-red-500">*</span></label>
                                <p-date-picker
                                    inputId="transactionDate"
                                    formControlName="transactionDate"
                                    [showTime]="true"
                                    dateFormat="yy-mm-dd"
                                    [showIcon]="true"
                                    styleClass="w-full">
                                </p-date-picker>
                            </div>

                            <!-- Transfer Specific: Fee and Exchange Rate -->
                            <ng-container *ngIf="isTransfer()">
                                <div class="mt-4 col-12 md:col-6 lg:col-4">
                                    <label for="fee" class="font-semibold text-900 mb-2 block">Fee</label>
                                    <p-inputNumber
                                        inputId="fee"
                                        formControlName="fee"
                                        mode="currency"
                                        [currency]="selectedCurrency()"
                                        locale="en-US"
                                        placeholder="0.00"
                                        styleClass="w-full">
                                    </p-inputNumber>
                                </div>
                                <div class="mt-4 col-12 md:col-6 lg:col-4">
                                    <label for="exchangeRate" class="font-semibold text-900 mb-2 block">Exchange
                                        Rate</label>
                                    <p-inputNumber
                                        inputId="exchangeRate"
                                        formControlName="exchangeRate"
                                        [minFractionDigits]="4"
                                        mode="decimal"
                                        placeholder="1.0000"
                                        styleClass="w-full">
                                    </p-inputNumber>
                                </div>
                            </ng-container>

                            <!-- Expense Specific: Installment -->
                            <ng-container *ngIf="isExpense()">
                                <div class="mt-4 col-12 md:col-6 lg:col-4">
                                    <label for="installmentCount" class="font-semibold text-900 mb-2 block">Installment
                                        Count <span class="text-red-500">*</span></label>
                                    <p-inputNumber
                                        inputId="installmentCount"
                                        formControlName="installmentCount"
                                        [showButtons]="true"
                                        [min]="1"
                                        [max]="120"
                                        styleClass="w-full">
                                    </p-inputNumber>
                                </div>
                                <div class="mt-4 col-12 md:col-6 lg:col-4">
                                    <label for="startDate" class="font-semibold text-900 mb-2 block">Installment Start
                                        Date <span class="text-red-500">*</span></label>
                                    <p-date-picker
                                        inputId="startDate"
                                        formControlName="startDate"
                                        dateFormat="yy-mm-dd"
                                        [showIcon]="true"
                                        styleClass="w-full">
                                    </p-date-picker>
                                </div>
                            </ng-container>

                            <!-- Note (Always visible) -->
                            <div class="mt-4 col-12">
                                <label for="note" class="font-semibold text-900 mb-2 block">Note</label>
                                <textarea
                                    pInputTextarea
                                    id="note"
                                    formControlName="note"
                                    rows="3"
                                    class="w-full"
                                    placeholder="Add description here...">
                                </textarea>
                            </div>

                            <!-- Form Error Message -->
                            <div class="mt-4 col-12">
                                <div class="text-sm text-red-500" *ngIf="transactionForm.invalid">
                                    Please fill all required fields correctly.
                                </div>
                            </div>
                        </div>
                    </form>
                </p-card>
            </div>
        </div>
    `
})
export class TransactionCreateComponent implements OnInit {
    private fb = inject(FormBuilder);
    // Use the local mock service
    private financeService = inject(PersonalFinanceService);
    private messageService = inject(MessageService);
    private router = inject(Router); // INJECTED Router

    transactionForm: FormGroup;

    // --- State Management with Signals ---
    // Data Sources
    transactionTypes: FinanceTransactionTypeDto[] = FinanceTransactionType.All;
    allAccounts = signal<FinanceAccount[]>([]);
    toAccounts = signal<FinanceAccount[]>([]);
    parentCategories = signal<FinanceCategory[]>([]);
    childCategories = signal<FinanceCategory[]>([]);
    buckets = signal<FinanceBucket[]>([]);

    // UI Flags
    loading = signal(false);
    saving = signal(false);
    showCategory = signal(false);
    showToAccount = signal(false);
    isTransfer = signal(false);
    isExpense = signal(false);

    // Labels & Currency
    fromAccountLabel = signal('Account');
    toAccountLabel = signal('To Account');
    selectedCurrency = signal('USD');

    constructor() {
        this.transactionForm = this.fb.group({
            type: [null, Validators.required],
            // Categories and Accounts
            parentCategory: [null],
            category: [null],
            fromAccount: [null, Validators.required],
            toAccount: [null],
            bucket: [null],
            // Amount and Dates
            amount: [null, [Validators.required, Validators.min(0.01)]],
            transactionDate: [new Date(), Validators.required],
            // Special Fields (Default to zero/initial values)
            fee: [0],
            exchangeRate: [1],
            installmentCount: [1],
            startDate: [new Date()],
            note: ['']
        });
    }

    ngOnInit(): void {
        this.loadInitialData();
    }

    loadInitialData() {
        this.loading.set(true);
        forkJoin({
            accounts: this.financeService.getFinanceAccounts(),
            parentCats: this.financeService.getFinanceParentCategories()
        }).subscribe({
            next: (data) => {
                this.allAccounts.set(data.accounts);
                this.parentCategories.set(data.parentCats);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load initial data:', err);
                this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load initial data.'});
                this.loading.set(false);
            }
        });
    }

    onTypeChange(typeId: number) {
        const type = FinanceTransactionType.All.find(t => t.id === typeId);
        if (!type) {
            this.resetFormControls(true);
            return;
        }

        this.resetFormControls(false); // Reset conditional fields

        // --- APPLY RULES ---

        // Category Requirement (Income, Expense, Credit Card Payment, Credit, Savings)
        const requiresCategory = [
            FinanceTransactionType.Income.id,
            FinanceTransactionType.Expense.id,
            FinanceTransactionType.CreditCardPayment.id,
            FinanceTransactionType.Credit.id,
            FinanceTransactionType.Savings.id
        ].includes(typeId);

        this.showCategory.set(requiresCategory);
        if (requiresCategory) {
            this.transactionForm.get('parentCategory')?.setValidators(Validators.required);
            this.transactionForm.get('category')?.setValidators(Validators.required);
        }

        // Destination Account (To Account) Requirement and Labels
        if (type.id === FinanceTransactionType.Transfer.id) {
            this.isTransfer.set(true);
            this.showToAccount.set(true);
            this.fromAccountLabel.set('From Account');
            this.toAccountLabel.set('To Account');
            this.toAccounts.set([...this.allAccounts()]); // All accounts
            this.transactionForm.get('toAccount')?.setValidators(Validators.required);
        } else if (type.id === FinanceTransactionType.CreditCardPayment.id) {
            this.showToAccount.set(true);
            this.toAccountLabel.set('Credit Card Account');
            // Only Credit Card Accounts
            const ccAccounts = this.allAccounts().filter(acc => acc.type === FinanceAccountType.CreditCardAccount.id);
            this.toAccounts.set(ccAccounts);
            this.transactionForm.get('toAccount')?.setValidators(Validators.required);
        } else if (type.id === FinanceTransactionType.Credit.id) {
            this.showToAccount.set(true);
            this.toAccountLabel.set('Loan Account');
            // Only Loan Accounts
            const loanAccounts = this.allAccounts().filter(acc => acc.type === FinanceAccountType.LoanAccount.id);
            this.toAccounts.set(loanAccounts);
            this.transactionForm.get('toAccount')?.setValidators(Validators.required);
        } else {
            this.fromAccountLabel.set('Account');
        }

        // Installment (Expense) Requirement
        if (type.id === FinanceTransactionType.Expense.id) {
            this.isExpense.set(true);
            this.transactionForm.get('installmentCount')?.setValidators(Validators.required);
            this.transactionForm.get('startDate')?.setValidators(Validators.required);
        }

        // Update validity of form fields
        this.transactionForm.get('parentCategory')?.updateValueAndValidity();
        this.transactionForm.get('category')?.updateValueAndValidity();
        this.transactionForm.get('toAccount')?.updateValueAndValidity();
        this.transactionForm.get('installmentCount')?.updateValueAndValidity();
        this.transactionForm.get('startDate')?.updateValueAndValidity();

        // If Destination Account is hidden, reset its value
        if (!this.showToAccount()) {
            this.transactionForm.get('toAccount')?.setValue(null);
        }
    }

    resetFormControls(fullReset: boolean) {
        // Reset UI flags
        this.showToAccount.set(false);
        this.isTransfer.set(false);
        this.isExpense.set(false);
        this.showCategory.set(false);
        this.fromAccountLabel.set('Account');
        this.toAccounts.set([]);
        this.childCategories.set([]);
        this.buckets.set([]);

        // Remove conditional validators
        this.transactionForm.get('parentCategory')?.clearValidators();
        this.transactionForm.get('category')?.clearValidators();
        this.transactionForm.get('toAccount')?.clearValidators();
        this.transactionForm.get('installmentCount')?.clearValidators();
        this.transactionForm.get('startDate')?.clearValidators();

        // Reset conditional fields
        this.transactionForm.get('parentCategory')?.setValue(null);
        this.transactionForm.get('category')?.setValue(null);
        this.transactionForm.get('toAccount')?.setValue(null);
        this.transactionForm.get('fee')?.setValue(0);
        this.transactionForm.get('exchangeRate')?.setValue(1);
        this.transactionForm.get('installmentCount')?.setValue(1);
        this.transactionForm.get('startDate')?.setValue(new Date());

        if (fullReset) {
            this.transactionForm.reset({
                amount: null,
                transactionDate: new Date(),
                note: '',
                fee: 0,
                exchangeRate: 1,
                installmentCount: 1,
                startDate: new Date(),
                type: null,
                fromAccount: null
            });
        }

        // Apply and update validity for removed validators
        this.transactionForm.get('parentCategory')?.updateValueAndValidity();
        this.transactionForm.get('category')?.updateValueAndValidity();
        this.transactionForm.get('toAccount')?.updateValueAndValidity();
        this.transactionForm.get('installmentCount')?.updateValueAndValidity();
        this.transactionForm.get('startDate')?.updateValueAndValidity();
    }

    onParentCategoryChange(parentId: string) {
        // Clear the sub-category when the primary category changes
        this.childCategories.set([]);
        this.transactionForm.get('category')?.setValue(null);

        if (!parentId) {
            return;
        }

        // Fetch child categories
        this.financeService.getFinanceCategories(1, 1000, parentId).subscribe((cats: any) => {

            this.childCategories.set(cats.data);

        });
    }

    onFromAccountChange(accountId: string) {
        const account = this.allAccounts().find(a => a.id === accountId);
        if (!account) {
            this.buckets.set([]);
            this.selectedCurrency.set('USD');
            return;
        }
        this.selectedCurrency.set(account.currencyCode ?? "USD");

        // Fetch buckets
        this.financeService.getBucketsByAccountId(account.id ?? "null").subscribe(buckets => {
            this.buckets.set(buckets);
            this.transactionForm.get('bucket')?.setValue(null);
        });
    }

    save(continueAdding: boolean) {
        // Mark all fields as touched to display validation errors
        this.transactionForm.markAllAsTouched();

        if (this.transactionForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill all required fields correctly.'
            });
            return;
        }
        this.saving.set(true);
        const payload = this.transactionForm.value;

        if (payload.fromAccount) {
            payload.fromAccount = this.allAccounts().find(x => x.id == payload.fromAccount);
        }

        if (payload.toAccount) {
            payload.toAccount = this.allAccounts().find(x => x.id == payload.toAccount);
        }

        if (payload.category) {
            payload.category = this.childCategories().find(x => x.id == payload.category);
        }

        if (payload.parentCategory) {
            payload.parentCategory = this.parentCategories().find(x => x.id == payload.parentCategory);
        }

        if (payload.bucket) {
            payload.bucket = this.buckets().find(x => x.id == payload.bucket);
        }

        this.financeService.createTransaction(payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Transaction saved successfully.'
                });

                this.saving.set(false);

                this.resetFormControls(true);
                this.loadInitialData();

                if (!continueAdding) {
                    this.close();
                }
            },
            error: (err) => {
                console.error('Failed to save transaction:', err);
                this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to save transaction.'});
                this.saving.set(false);
            }
        });
    }

    close() {
        this.router.navigate(['apps/finance/transactions']);
    }
}
