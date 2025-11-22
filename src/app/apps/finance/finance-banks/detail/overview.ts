import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FinanceBank } from '@/apps/finance/finance.types';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import {PersonalFinanceService} from "@/apps/finance/finance.service";
import {Textarea} from "primeng/textarea";

@Component({
    selector: 'app-bank-overview',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        InputTextModule,
        InputTextModule,
        SkeletonModule,
        Textarea
    ],
    template: `
    <div *ngIf="loading; then skeletonContent else actualContent"></div>

    <ng-template #actualContent>
        <div *ngIf="bank">
            <h3 class="text-xl font-semibold mb-3">Basic Information</h3>

            <div *ngIf="isEditing" class="p-fluid">
                <div class="field mb-4">
                    <label for="bankName" class="font-medium mb-2 block">Bank Name</label>
                    <input id="bankName" class="w-full" type="text" pInputText [(ngModel)]="editBank.name">
                </div>
                <div class="field mb-4">
                    <label for="bankDescription" class="font-medium mb-2 block">Description</label>
                    <textarea id="bankDescription" class="w-full" pInputTextarea [(ngModel)]="editBank.description" rows="3"></textarea>
                </div>

                <div class="flex justify-end gap-2 mt-5">
                    <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-secondary" (click)="cancelEditing()"></p-button>
                    <p-button label="Save Changes" icon="pi pi-check" styleClass="p-button-success" (click)="saveBankDetails()" [disabled]="!isDataChanged()"></p-button>
                </div>
            </div>

            <div *ngIf="!isEditing">
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col">
                        <span class="text-secondary font-medium">Name:</span>
                        <span class="text-lg text-900">{{ bank.name }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-secondary font-medium">Description:</span>
                        <span class="text-lg text-900">{{ bank.description || 'Not provided' }}</span>
                    </div>
                </div>
                <div class="mt-5 text-right">
                   <p-button label="Edit Profile" icon="pi pi-pencil" styleClass="p-button-primary" (click)="startEditing()"></p-button>
                </div>
            </div>
        </div>
    </ng-template>

    <ng-template #skeletonContent>
        <div class="flex flex-col gap-4">
            <p-skeleton width="70%" height="1.5rem"></p-skeleton>
            <p-skeleton width="90%" height="1rem"></p-skeleton>
            <p-skeleton width="50%" height="1rem"></p-skeleton>
            <p-skeleton width="80%" height="1rem"></p-skeleton>
        </div>
    </ng-template>
  `
})
export class BankOverviewComponent implements OnInit {
    bankId!: string;
    bank: FinanceBank | undefined;
    editBank!: FinanceBank;
    isEditing: boolean = false;
    loading: boolean = true; // Local loading state for fetching bank details

    constructor(
        private route: ActivatedRoute,
        private financeService: PersonalFinanceService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        // The parent component (FinanceBankDetailComponent) already loaded the data.
        // In a production app, we'd use a shared service or resolver.
        // For simplicity here, we'll listen to the route parameter and fetch data again (or simplify the fetch).
        this.bankId = this.route.parent!.snapshot.paramMap.get('id')!;
        this.loadBankDetails(this.bankId);
    }

    // NOTE: If you use a shared service/BehaviorSubject from the parent component,
    // you can simplify this to just subscribe to the shared bank data.
    loadBankDetails(id: string): void {
        this.loading = true;
        this.financeService.getFinanceBank(id)
            .subscribe({
                next: (response: any) => {
                    this.bank = response;
                    this.editBank = { ...response };
                    this.loading = false;
                },
                error: (err: any) => {
                    console.error('Error loading bank details:', err);
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load overview data.' });
                    this.loading = false;
                }
            });
    }

    startEditing(): void {
        if (this.bank) {
            this.editBank = JSON.parse(JSON.stringify(this.bank));
            this.isEditing = true;
        }
    }

    cancelEditing(): void {
        this.isEditing = false;
    }

    isDataChanged(): boolean {
        if (!this.bank || !this.editBank) return false;
        return this.bank.name !== this.editBank.name || this.bank.description !== this.editBank.description;
    }

    saveBankDetails(): void {
        if (!this.bankId || !this.editBank || !this.isDataChanged()) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No changes detected or data is invalid.' });
            return;
        }

        this.loading = true;

        this.financeService.updateFinanceBank(this.bankId, this.editBank)
            .subscribe({
                next: (updatedBankResponse: any) => {
                    this.bank = updatedBankResponse;
                    this.editBank = { ...updatedBankResponse };
                    this.isEditing = false;
                    this.loading = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Bank details updated successfully!' });
                },
                error: (err: any) => {
                    console.error('Error updating bank details:', err);
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update bank details.' });
                }
            });
    }
}
