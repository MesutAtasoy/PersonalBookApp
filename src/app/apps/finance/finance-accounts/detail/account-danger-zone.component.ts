import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import {Confirmation, ConfirmationService, MessageService} from 'primeng/api';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton'; // Import SkeletonModule
import { of, switchMap } from 'rxjs';
import {DatePickerModule} from "primeng/datepicker";
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {Divider} from "primeng/divider";
import {ConfirmDialog} from "primeng/confirmdialog";

@Component({
    selector: 'app-account-danger-zone',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        InputNumberModule,
        DatePickerModule,
        ReactiveFormsModule,
        ToastModule,
        SkeletonModule, // Added SkeletonModule
        CurrencyPipe,
        DatePipe,
        Divider,
        ConfirmDialog
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>
        <div class="space-y-6">

            <!-- 1. Deactivate Account -->
            <p-card [style]="{'border-left': '4px solid var(--primary-color)'}" styleClass="shadow-none">
                <ng-template pTemplate="header">
                    <div *ngIf="loading" class="p-4">
                        <p-skeleton width="15rem" height="1.5rem" styleClass="mb-1"></p-skeleton>
                        <p-skeleton width="10rem" height="0.75rem"></p-skeleton>
                    </div>
                    <div *ngIf="!loading" class="p-4">
                        <h3 class="text-xl font-semibold text-900">Deactivate Account</h3>
                        <p class="text-secondary text-sm">Deactivate the account</p>
                    </div>
                </ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loading">
                        <p-skeleton height="4rem" styleClass="mb-4"></p-skeleton>
                        <div class="flex justify-content-end">
                            <p-skeleton width="10rem" height="2rem"></p-skeleton>
                        </div>
                    </div>
                    <div *ngIf="!loading">
                        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p class="font-bold">You Are Deactivating Your Account</p>
                            <p class="text-sm">For extra security, this requires you to confirm your email or phone number when you deactivate the bank.</p>
                        </div>
                        <div class="flex justify-content-end">
                            <p-button
                                label="Deactivate Account"
                                icon="pi pi-shield"
                                severity="secondary"
                                (click)="onDeactivateAccount()"
                                styleClass="p-button-sm"
                            ></p-button>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <p-divider/>
            <!-- 2. Update Balance -->
            <p-card [formGroup]="balanceForm" [style]="{'border-left': '4px solid var(--primary-color)'}" styleClass="shadow-none">
                <ng-template pTemplate="header">
                    <div *ngIf="loading" class="p-4">
                        <p-skeleton width="15rem" height="1.5rem" styleClass="mb-1"></p-skeleton>
                        <p-skeleton width="10rem" height="0.75rem"></p-skeleton>
                    </div>
                    <div *ngIf="!loading" class="p-4">
                        <h3 class="text-xl font-semibold text-900">Update Balance</h3>
                        <p class="text-secondary text-sm">Update Balance</p>
                    </div>
                </ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loading">
                        <p-skeleton height="4rem" styleClass="mb-4"></p-skeleton>
                        <p-skeleton height="3rem" styleClass="mb-4"></p-skeleton>
                        <div class="flex justify-content-end">
                            <p-skeleton width="10rem" height="2rem"></p-skeleton>
                        </div>
                    </div>
                    <div *ngIf="!loading">
                        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p class="font-bold">You are updating your account balance</p>
                            <p class="text-sm">Just information, transaction will be stored after updating</p>
                        </div>

                        <div class="p-field flex flex-col gap-2 mb-4">
                            <label for="amount">Amount *</label>
                            <p-inputNumber
                                id="amount"
                                formControlName="amount"
                                mode="currency"
                                [currency]="account?.currencyCode || 'USD'"
                                locale="en-US"
                                [minFractionDigits]="2"
                                placeholder="0"
                                styleClass="w-full"
                            ></p-inputNumber>
                            <small *ngIf="balanceForm.get('amount')?.invalid && balanceForm.get('amount')?.touched" class="p-error">Amount is required.</small>
                        </div>

                        <div class="flex justify-content-end">
                            <p-button
                                label="Update Balance"
                                icon="pi pi-sync"
                                severity="info"
                                (click)="onUpdateBalance()"
                                [disabled]="balanceForm.invalid"
                                styleClass="p-button-sm"
                            ></p-button>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <p-divider/>
            <!-- 3. Close Account -->
            <p-card [formGroup]="closeForm" [style]="{'border-left': '4px solid var(--primary-color)'}" styleClass="shadow-none">
                <ng-template pTemplate="header">
                    <div *ngIf="loading" class="p-4">
                        <p-skeleton width="15rem" height="1.5rem" styleClass="mb-1"></p-skeleton>
                        <p-skeleton width="10rem" height="0.75rem"></p-skeleton>
                    </div>
                    <div *ngIf="!loading" class="p-4">
                        <h3 class="text-xl font-semibold text-900">Close Account</h3>
                        <p class="text-secondary text-sm">Close Account</p>
                    </div>
                </ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loading">
                        <p-skeleton height="4rem" styleClass="mb-4"></p-skeleton>
                        <p-skeleton height="3rem" styleClass="mb-4"></p-skeleton>
                        <div class="flex justify-content-end">
                            <p-skeleton width="10rem" height="2rem"></p-skeleton>
                        </div>
                    </div>
                    <div *ngIf="!loading">
                        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p class="font-bold">You are closing your account</p>
                            <p class="text-sm">For extra security, this requires you to confirm your email or phone number when you close the account. Reminder that, you can re-open the account</p>
                        </div>

                        <div class="p-field flex flex-col gap-2 mb-4">
                            <label for="closeDate">Date *</label>
                            <p-date-picker
                                id="closeDate"
                                formControlName="closeDate"
                                dateFormat="yy-mm-dd"
                                [showIcon]="true"
                                styleClass="w-full"
                                inputStyleClass="w-full"
                            ></p-date-picker>
                            <small *ngIf="closeForm.get('closeDate')?.invalid && closeForm.get('closeDate')?.touched" class="p-error">Close date is required.</small>
                        </div>

                        <div class="flex justify-content-end">
                            <p-button
                                label="Close Account"
                                icon="pi pi-times-circle"
                                [severity]="'warn'"
                                (click)="onCloseAccount()"
                                [disabled]="closeForm.invalid"
                                styleClass="p-button-sm"
                            ></p-button>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <p-divider/>
            <!-- 4. Delete Account -->
            <p-card [style]="{'border-left': '4px solid var(--primary-color)'}" styleClass="shadow-none">
                <ng-template pTemplate="header">
                    <div *ngIf="loading" class="p-4">
                        <p-skeleton width="15rem" height="1.5rem" styleClass="mb-1"></p-skeleton>
                        <p-skeleton width="10rem" height="0.75rem"></p-skeleton>
                    </div>
                    <div *ngIf="!loading" class="p-4">
                        <h3 class="text-xl font-semibold text-900">Delete Account</h3>
                        <p class="text-secondary text-sm">Delete Account</p>
                    </div>
                </ng-template>
                <ng-template pTemplate="content">
                    <div *ngIf="loading">
                        <p-skeleton height="4rem" styleClass="mb-4"></p-skeleton>
                        <div class="flex justify-content-end">
                            <p-skeleton width="10rem" height="2rem"></p-skeleton>
                        </div>
                    </div>
                    <div *ngIf="!loading">
                        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                            <p class="font-bold">You are deleting your account</p>
                            <p class="text-sm">The operation can not be undo</p>
                        </div>
                        <div class="flex justify-content-end">
                            <p-button
                                label="Delete Account"
                                icon="pi pi-trash"
                                severity="danger"
                                (click)="onDeleteAccount()"
                                styleClass="p-button-sm"
                            ></p-button>
                        </div>
                    </div>
                </ng-template>
            </p-card>
        </div>
    `
})
export class AccountDangerZoneComponent implements OnInit {
    bankId!: string;
    accountId!: string;
    account: any | null = null;
    loading: boolean = true; // Added loading state

    balanceForm!: FormGroup;
    closeForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private financeService: PersonalFinanceService,
        private messageService: MessageService,
        private _confirmationService : ConfirmationService
    ) {
        this.initForms();
    }

    ngOnInit(): void {

        var segments = this.router.url.split('/');
        this.accountId = segments[7];
        this.bankId = segments[5];

        this.financeService.getFinanceAccount(this.accountId)
            .subscribe({
                next: (response: any) => {
                    if (response) {
                        this.account = response.payload;
                        // Initialize balance form with loaded account data
                        this.balanceForm.patchValue({ amount: this.account?.balance || 0 });
                    }
                    this.loading = false; // Stop loading on success
                },
                error: (err: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load account details.' });
                    console.error(err);
                    this.loading = false; // Stop loading on error
                }
            });
    }

    initForms(): void {
        this.balanceForm = this.fb.group({
            amount: [0, Validators.required]
        });

        this.closeForm = this.fb.group({
            closeDate: [new Date(), Validators.required]
        });
    }

    // --- Action Handlers (kept same as previous implementation) ---

    onDeactivateAccount(): void {
        this.financeService
            .updateActiveFinanceAccount(this.accountId, {isActive: !this.account.isActive})
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Balance Updated',
                        detail: `Account deactived/actived`,
                        life: 5000
                    });
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not update balance.' });
                    console.error(err);
                }
            })
    }

    onUpdateBalance(): void {
        if (this.balanceForm.invalid) {
            this.balanceForm.markAllAsTouched();
            return;
        }

        const newBalance = this.balanceForm.value.amount;

        // Mock update logic
        this.financeService.updateFinanceAccountBalance(this.accountId, newBalance).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Balance Updated',
                    detail: `Account balance updated to: ${newBalance} ${this.account?.currencyCode || 'USD'}`,
                    life: 5000
                });
                if (this.account) {
                    this.account.balance = newBalance; // Optimistic UI update
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not update balance.' });
                console.error(err);
            }
        });
    }

    onCloseAccount(): void {
        if (this.closeForm.invalid) {
            this.closeForm.markAllAsTouched();
            return;
        }

        const closeDate = this.closeForm.value.closeDate;

        this.messageService.add({
            severity: 'warn',
            summary: 'Account Closure Initiated',
            detail: `Account closure scheduled for ${closeDate.toLocaleDateString()}. This action can be reversed.`,
            life: 7000
        });

        this.financeService.closeAccount(this.accountId, { closingDate: closeDate })
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Closed',
                        detail: `Account closed now`,
                        life: 5000
                    });
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not close account.' });
                    console.error(err);
                }
            })

    }

    deleteAccount(accountId: string): void {
        // Assume the service method is called deleteAccount(accountId)
        this.financeService.deleteFinanceAccount(accountId).subscribe({
            next: () => {
                this.messageService.add({severity: 'success', summary: 'Deleted', detail: `Account ID ${accountId} deleted successfully.`});

                this.router.navigate(['apps/finance/finance-banks/' + this.bankId + '/detail/accounts']);

            },
            error: (err) => {
                console.error('Deletion failed:', err);
                this.messageService.add({severity: 'error', summary: 'Error', detail: `Failed to delete account ID ${accountId}.`});
            }
        });
    }

    onDeleteAccount(): void {
        this._confirmationService.confirm({
            message: `Are you sure you want to delete the account: **${this.account?.name}** (${this.account?.type})? This action cannot be undone.`,
            header: 'Confirm Account Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deleteAccount(this.account?.id?.toString() ?? '');
            },
            reject: () => {
                this.messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation);
    }
}
