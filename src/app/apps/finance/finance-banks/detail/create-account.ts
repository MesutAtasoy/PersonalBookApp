import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';


// Data Models (assumed path)
import {
    FinanceAccountType,
    FinanceAccountTypeDto,
    CurrencyCode, FinanceBank
} from '@/apps/finance/finance.types';
import { PersonalFinanceService } from '@/apps/finance/finance.service';
import {SelectModule} from "primeng/select";
import {TextareaModule} from "primeng/textarea";
import {DatePickerModule} from "primeng/datepicker";

@Component({
    selector: 'app-account-create',
    standalone: true,
    // Note: If 'SelectModule' and 'DatePickerModule' are custom modules in your app,
    // you must ensure the imports below are correct according to your project structure.
    // I am using the standard component names in the template as requested.
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        SelectModule, // Maps to p-select
        InputTextModule,
        TextareaModule,
        DatePickerModule, // Maps to p-date-picker
        InputNumberModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <div class="p-4">
            <p-toast></p-toast>

            <h1 class="text-3xl font-bold mb-4">Create New Bank Account</h1>

            <form [formGroup]="financeAccountForm" (ngSubmit)="onSubmit()">

                <p-card header="Select Account Type" styleClass="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Account Categorization</h3>
                    <p class="mb-4 text-color-secondary">Choose the type of account to configure specific fields.</p>

                    <div class="p-field">
                        <label for="type" class="font-medium mb-2 block">Account Type *</label>
                        <p-select
                            id="type"
                            [options]="financeAccountTypes"
                            formControlName="type"
                            optionLabel="displayName"
                            placeholder="Select an account type"
                            (onChange)="onTypeChange($event.value)"
                            styleClass="w-full">
                        </p-select>
                        <small *ngIf="financeAccountForm.get('type')?.invalid && financeAccountForm.get('type')?.touched" class="p-error">Account type is required.</small>
                    </div>
                </p-card>

                <p-card header="General Details" styleClass="mb-4" *ngIf="selectedType">
                    <h3 class="text-lg font-semibold mb-2">Identification and Basic Information</h3>
                    <p class="mb-4 text-color-secondary">Name, holder details, and creation date for the account.</p>

                    <div class="">
                        <div class="p-field col-12 md:col-6">
                            <label for="name" class="font-medium mb-2 block">Name *</label>
                            <input id="name" type="text" pInputText formControlName="name" class="w-full">
                            <small *ngIf="financeAccountForm.get('name')?.invalid && financeAccountForm.get('name')?.touched" class="p-error">Name is required.</small>
                        </div>

                        <div class="p-field col-12 mt-4">
                            <label for="description" class="font-medium mb-2 block">Description</label>
                            <textarea id="description" pInputTextarea formControlName="description" rows="3" class="w-full"></textarea>
                        </div>

                    </div>
                </p-card>

                <p-card header="Account Details" styleClass="mb-4">
                    <h3 class="text-lg font-semibold mb-2">Identification Numbers</h3>
                    <p class="mb-4 text-color-secondary">IBAN and Account Number for transfers and reference.</p>

                    <div class="">
                        <div class="p-field col-12 md:col-6" *ngIf="isCurrentOrCreditCard">
                            <label for="accountHolderName" class="font-medium mb-2 block">Account Holder Name</label>
                            <input id="accountHolderName" type="text" pInputText formControlName="accountHolderName" class="w-full">
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4" *ngIf="isCurrentOrCreditCard">
                            <label for="accountNumber" class="font-medium mb-2 block">Account Number</label>
                            <input id="accountNumber" type="text" pInputText formControlName="accountNumber" class="w-full">
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4" *ngIf="isCurrentOrCreditCard">
                            <label for="iban" class="font-medium mb-2 block">IBAN</label>
                            <input id="iban" type="text" pInputText formControlName="iban" class="w-full">
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4" *ngIf="isCurrentOrCreditCard">
                            <label for="branchName" class="font-medium mb-2 block">Branch Name</label>
                            <input id="branchName" type="text" pInputText formControlName="branchName" class="w-full">
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="openingDate" class="font-medium mb-2 block">Opening Date *</label>
                            <p-date-picker id="openingDate" formControlName="openingDate" dateFormat="yy-mm-dd" [showIcon]="true" styleClass="w-full"></p-date-picker>
                        </div>
                    </div>
                </p-card>

                <p-card header="Balance & Currency Details" styleClass="mb-4" *ngIf="selectedType">
                    <h3 class="text-lg font-semibold mb-2">Financial Setup</h3>
                    <p class="mb-4 text-color-secondary">Set the initial balance and currency for accurate tracking.</p>

                    <div class="">
                        <div class="p-field col-12 md:col-6">
                            <label for="balance" class="font-medium mb-2 block">Initial Balance</label>
                            <p-inputNumber
                                id="balance"
                                formControlName="balance"
                                mode="currency"
                                [currency]="selectedCurrencyCode"
                                locale="en-US"
                                [minFractionDigits]="2"
                                styleClass="w-full"
                                inputStyleClass="w-full">
                            </p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="currencyCode" class="font-medium mb-2 block">Currency *</label>
                            <p-select
                                id="currencyCode"
                                [options]="currencyCodes"
                                formControlName="currencyCode"
                                optionLabel="code"
                                placeholder="Select currency"
                                styleClass="w-full">
                            </p-select>
                            <small *ngIf="financeAccountForm.get('currencyCode')?.invalid && financeAccountForm.get('currencyCode')?.touched" class="p-error">Currency is required.</small>
                        </div>
                    </div>
                </p-card>

                <p-card header="Credit Card Details" styleClass="mb-4" *ngIf="isCreditCard">
                    <h3 class="text-lg font-semibold mb-2">Credit and Payment Schedule</h3>
                    <p class="mb-4 text-color-secondary">Configure limits, debt, and payment cycle details.</p>

                    <div class="">
                        <div class="p-field col-12 md:col-6">
                            <label for="creditLimit" class="font-medium mb-2 block">Credit Limit</label>
                            <p-inputNumber id="creditLimit" formControlName="creditLimit" mode="currency" [currency]="selectedCurrencyCode" locale="en-US" [minFractionDigits]="2" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="currentDebt" class="font-medium mb-2 block">Current Debt</label>
                            <p-inputNumber id="currentDebt" formControlName="currentDebt" mode="currency" [currency]="selectedCurrencyCode" locale="en-US" [minFractionDigits]="2" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="availableCredit" class="font-medium mb-2 block">Available Credit</label>
                            <p-inputNumber id="availableCredit" formControlName="availableCredit" mode="currency" [currency]="selectedCurrencyCode" locale="en-US" [minFractionDigits]="2" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="statementClosingDate" class="font-medium mb-2 block">Statement Closing Date</label>
                            <p-date-picker id="statementClosingDate" formControlName="statementClosingDate" dateFormat="dd/mm/yyyy"  styleClass="w-full"></p-date-picker>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="minimumPayment" class="font-medium mb-2 block">Minumum Payment</label>
                            <p-inputNumber id="minimumPayment" formControlName="minimumPayment" mode="currency" [currency]="selectedCurrencyCode" locale="en-US" [minFractionDigits]="2" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="paymentDueDate" class="font-medium mb-2 block">Payment Due Date</label>
                            <p-date-picker id="paymentDueDate" formControlName="paymentDueDate" dateFormat="dd/mm/yyyy"  styleClass="w-full"></p-date-picker>
                        </div>
                    </div>
                </p-card>

                <p-card header="Loan Details" styleClass="mb-4" *ngIf="isLoan">
                    <h3 class="text-lg font-semibold mb-2">Loan Structure and Repayment</h3>
                    <p class="mb-4 text-color-secondary">Set the principal amount, interest rate, and installment schedule.</p>

                    <div class="">
                        <div class="p-field col-12 md:col-6">
                            <label for="loanNumber" class="font-medium mb-2 block">Loan Number</label>
                            <input id="loanNumber" type="text" pInputText formControlName="loanNumber" class="w-full">
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="principalTotalAmount" class="font-medium mb-2 block">Principal Total Amount</label>
                            <p-inputNumber id="principalTotalAmount" formControlName="principalTotalAmount" mode="currency" [currency]="selectedCurrencyCode" locale="en-US" [minFractionDigits]="2" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="interestAmount" class="font-medium mb-2 block">Interest Amount</label>
                            <p-inputNumber id="interestAmount" formControlName="interestAmount" mode="currency" [currency]="selectedCurrencyCode" locale="en-US" [minFractionDigits]="2" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="interestRate" class="font-medium mb-2 block">Interest Rate (%)</label>
                            <p-inputNumber id="interestRate" formControlName="interestRate" suffix="%" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="installmentCount" class="font-medium mb-2 block">Installment Count</label>
                            <p-inputNumber id="installmentCount" formControlName="installmentCount" [useGrouping]="false" [min]="1" styleClass="w-full" inputStyleClass="w-full"></p-inputNumber>
                        </div>
                        <div class="p-field col-12 md:col-6 mt-4">
                            <label for="startDate" class="font-medium mb-2 block">Loan Start Date *</label>
                            <p-date-picker id="startDate" formControlName="startDate" dateFormat="yy-mm-dd" [showIcon]="true" styleClass="w-full"></p-date-picker>
                        </div>
                    </div>
                </p-card>

                <div class="flex justify-content-end gap-3 mt-5">
                    <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-secondary" (click)="onCancel()"></p-button>
                    <p-button label="Create Account" icon="pi pi-check" type="submit" [disabled]="financeAccountForm.invalid"></p-button>
                </div>

            </form>
        </div>
    `
})
export class AccountCreateComponent implements OnInit {
    bank!: FinanceBank;
    bankId!: string;
    financeAccountForm!: FormGroup;
    financeAccountTypes: FinanceAccountTypeDto[] = FinanceAccountType.All;
    currencyCodes: CurrencyCode[] = [];

    // UI flags for conditional display
    selectedType: FinanceAccountTypeDto | null = null;
    isCurrent: boolean = false;
    isCreditCard: boolean = false;
    isLoan: boolean = false;
    isCurrentOrCreditCard: boolean = false;

    constructor(
        private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.bankId = this.route.parent!.snapshot.paramMap.get('id')!;
        this.initForm();
        this.loadCurrencyCodes();
        this.loadBankDetails(this.bankId);
    }

    loadBankDetails(id: string): void {
        this.financeService.getFinanceBank(id)
            .subscribe({
                next: (response: any) => {
                    this.bank = response;
                },
                error: (err: any) => {
                    console.error('Error loading bank details:', err);
                }
            });
    }

    // --- Initialization ---

    initForm(): void {
        this.financeAccountForm = this._formBuilder.group({
            bank: [{ id: this.bankId, name: '' }],
            type: [null, [Validators.required]],
            name: ['', [Validators.required]],
            description: [''],
            accountHolderName: [''],
            branchName: [''],
            openingDate: [null],
            iban: [''],
            accountNumber: [''],
            balance: [0],
            currencyCode: [null, [Validators.required]],
            creditLimit: [0],
            availableCredit: [0],
            currentDebt: [0],
            statementClosingDate: [null],
            minimumPayment: [0],
            paymentDueDate: [null],
            loanNumber: [''],
            principalTotalAmount: [0],
            interestAmount: [0],
            interestRate: [0],
            installmentCount: [0],
            startDate: [null]
        });

        this.setDynamicValidators(null);
    }

    loadCurrencyCodes(): void {
        this.financeService.getCurrencyCodes().subscribe({
            next: (response: any) => {
                this.currencyCodes = response.payload;
                const defaultCurrency = this.currencyCodes.find((c: CurrencyCode) => c.code === 'USD');
                if (defaultCurrency) {
                    this.financeAccountForm.get('currencyCode')?.setValue(defaultCurrency);
                }
            },
            error: (err) => {
                console.error('Failed to load currency codes', err);
                this.messageService.add({severity: 'error', summary: 'Error', detail: 'Failed to load currencies.'});
            }
        });
    }

    // --- Dynamic Form Logic ---

    onTypeChange(selectedTypeDto: FinanceAccountTypeDto): void {
        this.selectedType = selectedTypeDto;
        const typeId = selectedTypeDto ? selectedTypeDto.id : null;

        this.isCurrent = typeId === FinanceAccountType.CurrentAccount.id;
        this.isCreditCard = typeId === FinanceAccountType.CreditCardAccount.id;
        this.isLoan = typeId === FinanceAccountType.LoanAccount.id;
        this.isCurrentOrCreditCard = this.isCurrent || this.isCreditCard;

        this.setDynamicValidators(typeId);
    }

    setDynamicValidators(typeId: number | null): void {
        const controls = this.financeAccountForm.controls;

        const fieldsToClear = [
            'iban', 'accountNumber',
            'creditLimit', 'availableCredit', 'currentDebt', 'statementClosingDate', 'minimumPayment', 'paymentDueDate',
            'loanNumber', 'principalTotalAmount', 'interestAmount', 'interestRate', 'installmentCount', 'startDate'
        ];

        fieldsToClear.forEach(field => {
            controls[field].clearValidators();
            controls[field].setErrors(null);
        });

        // if (!this.isLoan) {
        //     controls['openingDate'].setValidators([Validators.required]);
        // } else {
        //     controls['openingDate'].clearValidators();
        // }

        if (typeId === FinanceAccountType.CreditCardAccount.id) {
            controls['creditLimit'].setValidators([Validators.required, Validators.min(0)]);
            controls['minimumPayment'].setValidators([Validators.min(0)]);
        } else if (typeId === FinanceAccountType.LoanAccount.id) {
            controls['loanNumber'].setValidators([Validators.required]);
            controls['principalTotalAmount'].setValidators([Validators.required, Validators.min(0)]);
            controls['interestRate'].setValidators([Validators.required, Validators.min(0)]);
            controls['installmentCount'].setValidators([Validators.required, Validators.min(1)]);
            controls['startDate'].setValidators([Validators.required]);
        }

        this.financeAccountForm.updateValueAndValidity();
    }

    // --- Submission ---

    onSubmit(): void {
        if (this.financeAccountForm.invalid) {
            this.financeAccountForm.markAllAsTouched();
            this.messageService.add({severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.'});
            return;
        }

        const rawValue = this.financeAccountForm.getRawValue();

        const payload: any = {};
        for (const key in rawValue) {
            if (this.shouldIncludeFieldInPayload(key)) {
                payload[key] = rawValue[key];
            }
        }

        payload.bank = { id: this.bankId , name: this.bank.name};
        payload.type = rawValue.type.id;
        payload.currencyCode = rawValue.currencyCode.code;

        this.financeService.addFinanceAccount(payload).subscribe({
            next: (response) => {
                this.messageService.add({severity: 'success', summary: 'Success', detail: 'Account created successfully!'});
                this.router.navigate(['apps/finance/finance-banks/' + this.bankId + '/detail/accounts']);
            },
            error: (err) => {
                console.error('Account creation failed:', err);
                this.messageService.add({severity: 'error', summary: 'Creation Failed', detail: 'Could not create account. Please try again.'});
            }
        });
    }

    shouldIncludeFieldInPayload(key: string): boolean {
        const coreFields = ['bank', 'type', 'name', 'description', 'accountHolderName', 'branchName', 'openingDate', 'balance', 'currencyCode'];
        const currentCardFields = ['iban', 'accountNumber'];
        const creditCardFields = ['creditLimit', 'availableCredit', 'currentDebt', 'statementClosingDate', 'minimumPayment', 'paymentDueDate'];
        const loanFields = ['loanNumber', 'principalTotalAmount', 'interestAmount', 'interestRate', 'installmentCount', 'startDate'];

        if (coreFields.includes(key)) return true;
        if (this.isCurrentOrCreditCard && currentCardFields.includes(key)) return true;
        if (this.isCreditCard && creditCardFields.includes(key)) return true;
        if (this.isLoan && loanFields.includes(key)) return true;

        return false;
    }

    onCancel(): void {
        this.router.navigate(['apps/finance/finance-banks/' + this.bankId + '/detail/accounts']);
    }

    get selectedCurrencyCode(): string {
        const currencyControl = this.financeAccountForm.get('currencyCode');
        const currencyValue = currencyControl?.value as CurrencyCode;
        return currencyValue && currencyValue.code ? currencyValue.code : 'USD';
    }
}
