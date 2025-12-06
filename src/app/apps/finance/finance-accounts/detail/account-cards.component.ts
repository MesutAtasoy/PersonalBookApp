import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { Observable, Subscription, of, switchMap, BehaviorSubject } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {Confirmation, ConfirmationService, MessageService} from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {SelectModule} from "primeng/select";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {Card, FinanceAccount} from "@/apps/finance/finance.types";
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {ToggleButton} from "primeng/togglebutton";

@Component({
    selector: 'app-account-cards',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        SelectModule,
        ToggleSwitchModule,
        ToastModule,
        SkeletonModule, // Skeleton module is imported
        ConfirmDialogModule,
        ToggleButton,
        FormsModule
    ],
    providers: [MessageService, DatePipe, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog [style]="{width: '50vw'}" [baseZIndex]="1000"></p-confirmDialog>
        <div class="p-4">
            <!-- Header and Add Button -->
            <div class="flex justify-between align-items-center mb-4">
                <h3 class="text-xl font-semibold text-900">Account Cards</h3>
                <p-button
                    label="Add New Card"
                    icon="pi pi-plus"
                    (click)="showAddDialog()"
                    styleClass="p-button-sm p-button-primary">
                </p-button>
            </div>

            <!-- Card List / Skeleton Loading -->
            <!-- Skeleton View activated when loading is true -->
            <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <p-card *ngFor="let i of [1,2,3]" styleClass="shadow-md">
                    <ng-template pTemplate="content">
                        <div class="flex justify-content-between mb-4">
                            <p-skeleton width="3rem" height="3rem" styleClass="border-round-lg"></p-skeleton>
                            <p-skeleton width="2rem" height="1.5rem" styleClass="border-round-lg"></p-skeleton>
                        </div>
                        <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
                        <p-skeleton height=".8rem" width="70%" styleClass="mb-4"></p-skeleton>
                        <div class="flex justify-content-between">
                            <p-skeleton width="6rem" height="2rem"></p-skeleton>
                            <p-skeleton width="6rem" height="2rem"></p-skeleton>
                        </div>
                    </ng-template>
                </p-card>
            </div>

            <!-- Actual Card List -->
            <div *ngIf="!loading && cards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <p-card *ngFor="let card of cards" styleClass="shadow-lg border-round-lg {{ getCardThemeClass(card.cardType) }}">
                    <ng-template pTemplate="header">
                        <div class="p-4 flex justify-between align-items-start">
                            <i [class]="'pi ' + getCardIcon(card.cardType) + ' text-4xl text-white'"></i>
                            <p-toggle-switch
                                [(ngModel)]="card.isActive"
                                (onChange)="toggleCardStatus(card)"
                                [disabled]="isSubmitting"
                            ></p-toggle-switch>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="content">
                        <div class="text-white">
                            <div class="text-lg font-mono tracking-widest mb-3">
                                {{ formatCardNumber(card.cardNumber) }}
                            </div>
                            <div class="flex justify-between align-items-end">
                                <div>
                                    <div class="text-sm font-light">Card Holder</div>
                                    <div class="font-medium text-lg">{{ card.cardHolderName || 'N/A' }}</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-light">Expires</div>
                                    <div class="font-medium text-lg">{{ card.expirationDate | date:'MM/yy' }}</div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="footer" style="background-color: darkgray">
                        <div class="flex justify-end gap-2">
                            <p-button
                                icon="pi pi-pencil"
                                (click)="showEditDialog(card)"
                                label="Edit"
                                styleClass="p-button-sm p-button-text p-button-secondary"
                            ></p-button>
                            <p-button
                                icon="pi pi-trash"
                                (click)="delete(card)"
                                label="Delete"
                                styleClass="p-button-sm p-button-text p-button-danger"
                            ></p-button>
                        </div>
                    </ng-template>
                </p-card>
            </div>

            <div *ngIf="!loading && cards.length === 0" class="text-center p-5 border-2 border-dashed border-surface-200 border-round-lg">
                <i class="pi pi-credit-card text-6xl text-surface-400 mb-3"></i>
                <p class="text-lg text-surface-600">No cards found for this account. Click "Add New Card" to begin.</p>
            </div>
        </div>

        <!-- Add/Edit Card Dialog -->
        <p-dialog
            [(visible)]="cardDialogVisible"
            [header]="isEditMode ? 'Edit Card' : 'Add New Card'"
            [modal]="true"
            [style]="{width: '50vw'}"
            [draggable]="false"
            [resizable]="false"
            (onHide)="resetForm()"
        >
            <form [formGroup]="cardForm" class="justify-between">
                <!-- Card Holder Name -->
                <div class="field mb-3">
                    <label for="cardHolderName" class="font-medium block">Card Holder Name *</label>
                    <input pInputText id="cardHolderName" type="text" formControlName="cardHolderName" placeholder="John Doe" />
                    <small *ngIf="cardForm.get('cardHolderName')?.invalid && cardForm.get('cardHolderName')?.touched" class="p-error">Name is required.</small>
                </div>

                <!-- Card Number -->
                <div class="field mb-3">
                    <label for="cardNumber" class="font-medium block">Card Number *</label>
                    <input pInputText id="cardNumber" type="text" formControlName="cardNumber" placeholder="**** **** **** 1234" maxlength="19" />
                    <small *ngIf="cardForm.get('cardNumber')?.invalid && cardForm.get('cardNumber')?.touched" class="p-error">
                        Card number must be 16 digits.
                    </small>
                </div>

                <!-- Expiration and CVV -->
                <div class="row">
                    <div class="field col-6 mb-3">
                        <label for="expirationMonth" class="font-medium block">Expiration Month *</label>
                        <p-select
                            id="expirationMonth"
                            formControlName="expirationMonth"
                            [options]="months"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="MM"
                        ></p-select>
                        <small *ngIf="cardForm.get('expirationMonth')?.invalid && cardForm.get('expirationMonth')?.touched" class="p-error">Required.</small>
                    </div>
                    <div class="field col-6 mb-3">
                        <label for="expirationYear" class="font-medium block">Expiration Year *</label>
                        <p-select
                            id="expirationYear"
                            formControlName="expirationYear"
                            [options]="years"
                            placeholder="YY"
                        ></p-select>
                        <small *ngIf="cardForm.get('expirationYear')?.invalid && cardForm.get('expirationYear')?.touched" class="p-error">Required.</small>
                    </div>
                </div>

                <div class="row">
                    <div class="col-6 mb-3">
                        <label for="cardType" class="font-medium block">Card Type *</label>
                        <p-select id="cardType" formControlName="cardType" [options]="cardTypes" placeholder="Select Type"
                        ></p-select>
                        <small *ngIf="cardForm.get('cardType')?.invalid && cardForm.get('cardType')?.touched" class="p-error">Type is required.</small>
                    </div>
                    <div class="col-6 mb-3">
                        <label for="cardValidationValue" class="font-medium block">CVV *</label>
                        <input pInputText id="cardValidationValue" type="text" formControlName="cardValidationValue" placeholder="123" maxlength="4" />
                        <small *ngIf="cardForm.get('cardValidationValue')?.invalid && cardForm.get('cardValidationValue')?.touched" class="p-error">CVV must be 3 or 4 digits.</small>
                    </div>
                </div>

                <div class="field mb-3 flex items-center gap-3">
                    <p-toggle-switch id="isActive" formControlName="isActive"></p-toggle-switch>
                    <label for="isActive" class="font-medium">Is Active</label>
                </div>
            </form>

            <ng-template pTemplate="footer">
                <p-button
                    label="Cancel"
                    icon="pi pi-times"
                    (click)="cardDialogVisible=false"
                    styleClass="p-button-text"
                ></p-button>
                <p-button
                    [label]="isEditMode ? 'Save Changes' : 'Create Card'"
                    [icon]="isEditMode ? 'pi pi-check' : 'pi pi-save'"
                    (click)="saveCard()"
                    [disabled]="cardForm.invalid || isSubmitting"
                    [loading]="isSubmitting"
                ></p-button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        /* Custom styles for card aesthetics */
        .visa {
            background: linear-gradient(135deg, #1d4ed8 0%, #3730a3 100%); /* Blue-700 to Indigo-800 */
        }
        .mastercard {
            /* FIXED: Hex codes are used here instead of the problematic CSS variables */
            background: linear-gradient(135deg, #f97316 0%, #b91c1c 100%); /* Orange-500 to Red-700 */
        }
        .amex {
            background: linear-gradient(135deg, #047857 0%, #115e59 100%); /* Green-700 to Teal-800 */
        }
        .default {
            background: linear-gradient(135deg, #737373 0%, #404040 100%); /* Surface-500 to Surface-700 (Gray) */
        }
        :host ::ng-deep .p-card-body {
            height: 100%; /* Ensure content fills card */
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
    `]
})
export class AccountCardsComponent implements OnInit, OnDestroy {
    accountId!: string;
    cards: Card[] = [];
    loading: boolean = true; // State controls skeleton visibility
    cardDialogVisible: boolean = false;
    isEditMode: boolean = false;
    isSubmitting: boolean = false;
    cardForm!: FormGroup;
    private routeSubscription!: Subscription;
    private currentCardId: string | undefined;

    // Dropdown options
    cardTypes = ['Visa', 'MasterCard', 'Amex', 'Discover'];
    months = Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1).padStart(2, '0'),
        value: i + 1
    }));
    years: number[] = [];

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private financeService: PersonalFinanceService,
        private datePipe: DatePipe,
        private confirmationService : ConfirmationService,
        private messageService: MessageService
    ) {
        this.initForm();
        this.initYears();
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.parent!.params.subscribe((params: Params) => {
            this.accountId = params['accountId'];
            if (this.accountId) {
                this.loadCards();
            }
        });
    }

    ngOnDestroy(): void {
        this.routeSubscription.unsubscribe();
    }

    initYears(): void {
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 10; i++) {
            this.years.push(currentYear + i);
        }
    }

    initForm(): void {
        this.cardForm = this.fb.group({
            id: [null],
            cardHolderName: ['', Validators.required],
            // Card number should be 16 digits when stripped of spaces
            cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9\s]{16,19}$/)]],
            cardType: [null, Validators.required],
            expirationMonth: [null, Validators.required],
            expirationYear: [null, Validators.required],
            cardValidationValue: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]], // 3 or 4 digits CVV
            isActive: [true]
        });
    }

    loadCards(): void {
        this.loading = true;
        // Introduce a small delay to clearly show the skeleton effect in the mock environment
        this.financeService.getCardsByAccountId(this.accountId).subscribe({
            next: (data) => {
                this.cards = data;
                // Calculate expirationDate string for display pipe
                this.cards.forEach(card => this.updateExpirationDate(card));
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cards.' });
                this.loading = false;
                console.error(err);
            }
        });
    }

    showAddDialog(): void {
        this.isEditMode = false;
        this.initForm();
        this.cardDialogVisible = true;
    }

    showEditDialog(card: Card): void {
        this.isEditMode = true;
        this.currentCardId = card.id;
        this.cardForm.patchValue({
            ...card,
            cardNumber: card.cardNumber?.replace(/\s/g, '') // Remove spaces for editing
        });
        this.cardDialogVisible = true;
    }

    resetForm(): void {
        this.cardForm.reset({ isActive: true });
        this.currentCardId = undefined;
        this.isSubmitting = false;
    }

    saveCard(): void {
        if (this.cardForm.invalid) {
            this.cardForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const formValue = this.cardForm.value;

        // 1. Prepare Request Data
        const request: Card = {
            cardHolderName: formValue.cardHolderName,
            // Remove spaces from card number before sending to API
            cardNumber: formValue.cardNumber.replace(/\s/g, ''),
            cardType: formValue.cardType,
            expirationMonth: formValue.expirationMonth,
            expirationYear: formValue.expirationYear,
            cardValidationValue: formValue.cardValidationValue,
            isActive: formValue.isActive
        };

        let operation: Observable<Card>;

        if (this.isEditMode && this.currentCardId) {
            operation = this.financeService.updateCard(this.accountId, this.currentCardId, request);
        } else {
            operation = this.financeService.addCard(this.accountId, request);
        }

        // 2. Execute Operation
        operation.subscribe({
            next: (newCard) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: this.isEditMode ? 'Card updated successfully.' : 'Card added successfully.'
                });
                this.cardDialogVisible = false;
                this.loadCards(); // Refresh list
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Operation failed.' });
                console.error(err);
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

    toggleCardStatus(card: Card): void {
        if (!card.id) return;

        // We only send the ID and the new status
        const request = { isActive: card.isActive };
        this.isSubmitting = true;

        this.financeService.updateCard(this.accountId, card.id, request).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Status Updated',
                    detail: `Card is now ${card.isActive ? 'Active' : 'Inactive'}.`
                });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not change card status.' });
                // Revert UI on failure
                card.isActive = !card.isActive;
                console.error(err);
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

    // --- Utility Methods for Template ---

    getCardThemeClass(cardType?: string): string {
        switch (cardType?.toLowerCase()) {
            case 'visa': return 'visa';
            case 'mastercard': return 'mastercard';
            case 'amex': return 'amex';
            default: return 'default';
        }
    }

    getCardIcon(cardType?: string): string {
        switch (cardType?.toLowerCase()) {
            case 'visa': return 'pi-visa';
            case 'mastercard': return 'pi-credit-card';
            case 'amex': return 'pi-wallet';
            default: return 'pi-tag';
        }
    }

    formatCardNumber(numberString?: string): string {
        if (!numberString) return '**** **** **** ****';
        // Insert space every 4 digits
        return numberString.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || numberString;
    }

    updateExpirationDate(card: Card): void {
        if (card.expirationYear && card.expirationMonth) {
            // Create a date object for the DatePipe
            card.expirationDate = new Date(card.expirationYear, card.expirationMonth - 1, 1).toISOString();
        }
    }

    delete(card: Card | null) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete the card ending in ${card?.cardNumber?.slice(-4)}?`,
            header: 'Confirm Account Card',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.deleteCard(card);
            },
            reject: () => {
                this.messageService.add({severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled'});
            }
        } as Confirmation); // Cast to Confirmation type if needed, though Angular often infers this.
    }

    deleteCard(card: Card | null){
        this.financeService.deleteCard(this.accountId, card?.id ?? "")
            .subscribe({
                next: () => {
                    this.messageService.add({severity: 'success', summary: 'Deleted', detail: `The card has been successfully deleted.`});
                    this.loadCards();

                },
                error: (err) => {
                    console.error('Deletion failed:', err);
                    this.messageService.add({severity: 'error', summary: 'Error', detail: `Failed to delete card.`});
                }
        });
    }
}
