import {Component, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ActivatedRoute, Router, Params} from '@angular/router';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormControl} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {SkeletonModule} from 'primeng/skeleton';
import {ToastModule} from 'primeng/toast';
import {SelectModule} from "primeng/select";
import {DatePickerModule} from "primeng/datepicker";
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {CurrencyCode, FinanceAccount, FinanceAccountType} from "@/apps/finance/finance.types";
import {Divider} from "primeng/divider";

@Component({
    selector: 'app-account-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        DatePickerModule,
        InputNumberModule,
        SkeletonModule,
        ToastModule,
        Divider
    ],
    providers: [MessageService, PersonalFinanceService],
    template: `
        <div class="shadow-none">
            <p-toast></p-toast>

            <!-- Loading Skeleton -->
            <div *ngIf="loading" class="p-4">
                <div class="">
                    <div class="col-12 md:col-6">
                        <p-skeleton width="100%" height="2rem"></p-skeleton>
                    </div>
                    <div class="col-12 md:col-6">
                        <p-skeleton width="100%" height="2rem"></p-skeleton>
                    </div>
                    <div class="col-12">
                        <p-skeleton width="100%" height="2rem"></p-skeleton>
                    </div>
                    <div class="col-12 mt-4">
                        <p-skeleton width="100%" height="15rem"></p-skeleton>
                    </div>
                    <div class="col-12 text-right mt-4">
                        <p-skeleton width="8rem" height="2.5rem"></p-skeleton>
                    </div>
                </div>
            </div>

            <!-- Edit Form -->
            <form [formGroup]="editForm" (ngSubmit)="onSave()" *ngIf="!loading && accountId">
                <div class="">
                    <h3 class="text-xl font-semibold mb-2">General Information</h3>

                    <div class="col-12 md:col-6">
                        <label for="name" class="font-medium mb-2 block">Name</label>
                        <input id="name" type="text" pInputText formControlName="name" class="w-full"
                               [placeholder]="account?.name || 'e.g., Main Checking Account'">
                    </div>

                    <div class="col-12 md:col-6 mt-4">
                        <label for="type" class="font-medium mb-2 block">Account Type* (Cannot be changed)</label>
                        <p-select id="type" [options]="accountTypes" formControlName="type" class="w-full"
                                  optionLabel="displayName" optionValue="id" [disabled]="true"></p-select>
                    </div>

                    <div class="col-12 md:col-6 mt-4">
                        <label for="description" class="font-medium mb-2 block">Description</label>
                        <input id="description" type="text" pInputText formControlName="description" class="w-full">
                    </div>

                    <p-divider/>

                    <!-- Financial Details -->
                    <h4 class="col-12 text-xl font-semibold mt-4 mb-2 border-bottom-1 surface-border pb-2">Financial Details</h4>

                    <div class="col-12 md:col-6">
                        <label for="accountNumber" class="font-medium mb-2 block">Account Holder Name</label>
                        <input id="accountNumber" type="text" pInputText formControlName="accountHolderName" class="w-full"
                               [placeholder]="account?.accountHolderName || 'e.g., Main Checking Account'">
                    </div>

                    <div class="col-12 md:col-6 mt-4">
                        <label for="accountNumber" class="font-medium mb-2 block">Account Number</label>
                        <input id="accountNumber" type="text" pInputText formControlName="accountNumber" class="w-full" [placeholder]="account?.accountNumber">
                    </div>

                    <div class="col-12 md:col-6 mt-4">
                        <label for="name" class="font-medium mb-2 block">IBAN</label>
                        <input id="name" type="text" pInputText formControlName="iban" class="w-full" [placeholder]="account?.iban">
                    </div>

                    <div class="col-12 md:col-6 mt-4">
                        <label for="branchName" class="font-medium mb-2 block">Branch Name</label>
                        <input id="branchName" type="text" pInputText formControlName="branchName" class="w-full" [placeholder]="account?.branchName">
                    </div>



                    <!-- Credit Card Specific Fields -->
                    <ng-container *ngIf="isCreditCard">
                        <h4 class="col-12 text-xl font-semibold mt-4 mb-2 text-blue-500 border-bottom-1 surface-border pb-2">
                            Credit Card Details</h4>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="creditLimit" class="font-medium mb-2 block">Credit Limit*</label>
                            <p-inputNumber id="creditLimit" formControlName="creditLimit" mode="currency" class="w-full"
                                           [currency]="editForm.get('currencyCode')?.value || 'USD'"
                                           locale="en-US"></p-inputNumber>
                            <small *ngIf="editForm.get('creditLimit')?.invalid && editForm.get('creditLimit')?.touched"
                                   class="p-error">Limit is required.</small>
                        </div>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="creditLimit" class="font-medium mb-2 block">Available Credit*</label>
                            <p-inputNumber id="availableCredit" formControlName="availableCredit" mode="currency" class="w-full"
                                           [currency]="editForm.get('currencyCode')?.value || 'USD'"
                                           locale="en-US"></p-inputNumber>
                            <small *ngIf="editForm.get('availableCredit')?.invalid && editForm.get('availableCredit')?.touched"
                                   class="p-error">Available Credit is required.</small>
                        </div>


                        <div class="col-12 md:col-6 mt-4">
                            <label for="minimumPayment" class="font-medium mb-2 block">Minimum Payment</label>
                            <p-inputNumber id="minimumPayment" formControlName="minimumPayment" mode="currency" class="w-full"
                                           [currency]="editForm.get('currencyCode')?.value || 'USD'"
                                           locale="en-US"></p-inputNumber>
                        </div>



                        <div class="col-12 md:col-6 mt-4">
                            <label for="paymentDueDate" class="font-medium mb-2 block">Payment Due Date</label>
                            <p-date-picker id="paymentDueDate" formControlName="paymentDueDate"  class="w-full"
                                        [showIcon]="true"></p-date-picker>
                        </div>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="statementClosingDate" class="font-medium mb-2 block">Statement Closing Date</label>
                            <p-date-picker id="statementClosingDate" formControlName="statementClosingDate"  class="w-full"
                                           [showIcon]="true"></p-date-picker>
                        </div>

                    </ng-container>

                    <!-- Loan Specific Fields -->
                    <ng-container *ngIf="isLoan">
                        <p-divider/>
                        <h4 class="col-12 text-xl font-semibold mt-4 mb-2 border-bottom-1 surface-border pb-2">Loan Details</h4>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="loanNumber" class="font-medium mb-2 block">Loan Number*</label>
                            <input id="loanNumber" type="text" pInputText formControlName="loanNumber" class="w-full">
                            <small *ngIf="editForm.get('loanNumber')?.invalid && editForm.get('loanNumber')?.touched"
                                   class="p-error">Loan number is required.</small>
                        </div>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="principalTotalAmount" class="font-medium mb-2 block">Principal Total Amount*</label>
                            <p-inputNumber id="principalTotalAmount" formControlName="principalTotalAmount" class="w-full"
                                           mode="currency" [currency]="editForm.get('currencyCode')?.value || 'USD'"
                                           locale="en-US"></p-inputNumber>
                            <small
                                *ngIf="editForm.get('principalTotalAmount')?.invalid && editForm.get('principalTotalAmount')?.touched"
                                class="p-error">Principal is required.</small>
                        </div>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="principalTotalAmount" class="font-medium mb-2 block">Interest Amount*</label>
                            <p-inputNumber id="interestAmount" formControlName="interestAmount" class="w-full"
                                           mode="currency" [currency]="editForm.get('currencyCode')?.value || 'USD'"
                                           locale="en-US"></p-inputNumber>
                            <small
                                *ngIf="editForm.get('interestAmount')?.invalid && editForm.get('interestAmount')?.touched"
                                class="p-error">Interest Amount is required.</small>
                        </div>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="interestRate" class="font-medium mb-2 block">Interest Rate (%)</label>
                            <p-inputNumber id="interestRate" formControlName="interestRate" suffix="%" class="w-full"
                                           [minFractionDigits]="2"></p-inputNumber>
                        </div>

                        <div class="col-12 md:col-6 mt-4">
                            <label for="installmentCount" class="font-medium mb-2 block">Installment Count</label>
                            <p-inputNumber id="installmentCount" formControlName="installmentCount" [showButtons]="true" class="w-full"
                                           [min]="1" [max]="360"></p-inputNumber>
                        </div>
                    </ng-container>

                    <!-- Submit Button -->
                    <div class="col-12 text-right mt-5">
                        <p-button label="Cancel" severity="secondary" (onClick)="onCancel()"
                                  styleClass="p-button-text"></p-button>
                        <p-button label="Update Account" icon="pi pi-save" type="submit" [loading]="isSubmitting"
                                  [disabled]="editForm.invalid"></p-button>
                    </div>

                </div>
            </form>
        </div>
    `
})
export class AccountSettingsComponent implements OnInit {
    bankId!: string;
    accountId!: string;
    editForm!: FormGroup;
    loading: boolean = true;
    isSubmitting: boolean = false;
    account: any | null = null;

    accountTypes = FinanceAccountType.All;
    currencyOptions: CurrencyCode[] = [];

    isCreditCard: boolean = false;
    isLoan: boolean = false;
    financeBank: any;
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService,
        private messageService: MessageService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        var segments = this.router.url.split('/');
        this.bankId = segments[5];
        this.accountId = segments[7];

        if (this.accountId) {
            this.loadFormData();
            this.loadCurrencyOptions();
        } else {
            this.messageService.add({severity: 'error', summary: 'Error', detail: 'Account ID missing.'});
            this.loading = false;
        }
    }

    initForm(): void {
        this.editForm = this.fb.group({
            bank: [null],
            type: [''],
            name: [''],
            description: [''],
            iban: [''],
            accountNumber: [''],
            accountHolderName: [''],
            branchName: [''],
            openingDate: [''],
            creditLimit: [0],
            availableCredit: [0],
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
    }

    loadCurrencyOptions(): void {
        this.financeService.getCurrencyCodes().subscribe(codes => {
            this.currencyOptions = codes.payload;
        });
    }

    loadFormData(): void {
        this.loading = true;
        this.financeService.getFinanceAccount(this.accountId)
            .subscribe({
                next: (response: any) => {
                    this.account = response.payload;
                    this.financeBank = this.account?.financeBank;
                    this.setDynamicVisibility(this.account?.type ?? 0);
                    this.patchFormValues(this.account);
                    this.loading = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load account data.'
                    });
                    this.loading = false;
                    console.error(err);
                }
            });
    }

    patchFormValues(financeAccount: any): void {

        this.editForm.patchValue({
            type: financeAccount.type,
            name: financeAccount.name,
            description: financeAccount.description,
            iban: financeAccount.iban,
            accountNumber: financeAccount.accountNumber,
            accountHolderName: financeAccount.accountHolderName,
            branchName: financeAccount.branchName,
            openingDate: financeAccount.openingDate,
            creditLimit: financeAccount.creditLimit,
            availableCredit: financeAccount.availableCredit,
            statementClosingDate: financeAccount.statementClosingDate,
            minimumPayment: financeAccount.minimumPayment,
            paymentDueDate: financeAccount.paymentDueDate,
            loanNumber: financeAccount.loanNumber,
            principalTotalAmount: financeAccount.principalTotalAmount,
            interestAmount: financeAccount.interestAmount,
            interestRate: financeAccount.interestRate,
            installmentCount: financeAccount.installmentCount,
            startDate: financeAccount.startDate
        });
    }

    setDynamicVisibility(typeId: number): void {

        this.isCreditCard = typeId === FinanceAccountType.CreditCardAccount.id;
        this.isLoan = typeId === FinanceAccountType.LoanAccount.id;

        // Remove all dynamic validators first
        this.clearDynamicValidators();

        // Apply specific validators based on type
        if (this.isCreditCard) {
            this.editForm.get('creditLimit')?.setValidators(Validators.required);
        } else if (this.isLoan) {
            this.editForm.get('loanNumber')?.setValidators(Validators.required);
            this.editForm.get('principalTotalAmount')?.setValidators(Validators.required);
        }

        // Update validity of controls
        this.editForm.get('creditLimit')?.updateValueAndValidity();
        this.editForm.get('loanNumber')?.updateValueAndValidity();
        this.editForm.get('principalTotalAmount')?.updateValueAndValidity();
    }

    clearDynamicValidators(): void {
        this.editForm.get('creditLimit')?.clearValidators();
        this.editForm.get('loanNumber')?.clearValidators();
        this.editForm.get('principalTotalAmount')?.clearValidators();
    }

    onSave(): void {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            this.messageService.add({
                severity: 'warn',
                summary: 'Invalid Form',
                detail: 'Please fill in all required fields.'
            });
            return;
        }

        this.isSubmitting = true;
        const formValue = this.editForm.getRawValue();

        formValue.bank = {id: this.financeBank.id, name: this.financeBank.name};


        this.financeService.updateFinanceAccount(this.accountId, formValue).subscribe({
            next: () => {
                debugger;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Account updated successfully!'
                });
                this.isSubmitting = false;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: 'Could not update account.'
                });
                this.isSubmitting = false;
                console.error(err);
            }
        });
    }

    onCancel(): void {
        // Navigate back to the main detail view for the account
        this.router.navigate(['..'], {relativeTo: this.route, replaceUrl: true});
    }
}
