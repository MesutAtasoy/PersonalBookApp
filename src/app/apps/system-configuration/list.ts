import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SearchFilter } from "@/core/pagination/personal-book.pagination";
import {SystemConfigurationService} from "@/apps/system-configuration/system-configurations.service";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";

export interface SystemConfiguration {
    id?: string;
    key?: string;
    value?: string;
    createdDate?: string;
    modifiedDate?: string;
}

@Component({
    selector: 'app-system-configuration',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, InputTextModule,
        TextareaModule, ToastModule, SkeletonModule, ConfirmDialogModule,
        PaginatorModule, DialogModule, TooltipModule, IconField, InputIcon
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-right"></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <p-dialog [(visible)]="displayDialog"
                  [header]="editingConfig?.id ? 'Update Configuration' : 'New Configuration Key'"
                  [modal]="true"
                  [style]="{width: '500px'}"
                  [draggable]="false"
                  class="config-dialog">

            <div class="flex flex-col gap-5 py-4" *ngIf="editingConfig">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration Key</label>
                    <input type="text" pInputText [(ngModel)]="editingConfig.key"
                           [disabled]="!!editingConfig.id"
                           placeholder="e.g. SYSTEM_TIMEOUT"
                           class="w-full p-3 bg-slate-50 border-none rounded-xl font-mono text-sm" />
                    <small class="text-slate-400" *ngIf="editingConfig.id">Keys cannot be changed after creation.</small>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value / Settings</label>
                    <textarea pTextarea [(ngModel)]="editingConfig.value" rows="8"
                              placeholder="Enter value or JSON string..."
                              class="w-full p-3 bg-slate-50 border-none rounded-xl font-mono text-sm resize-none"></textarea>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text p-button-secondary" (click)="displayDialog = false"></button>
                <button pButton label="Confirm" class="p-button-primary px-6 rounded-lg" [loading]="isSaving" (click)="onSave()"></button>
            </ng-template>
        </p-dialog>

        <div class="flex h-screen w-full bg-white overflow-hidden">

            <div class="flex flex-col w-[380px] border-r border-slate-200 bg-slate-50/30">
                <div class="p-6 bg-white border-b border-slate-200">
                    <div class="flex justify-between items-center mb-4">
                        <h1 class="text-xl font-black text-slate-800 uppercase tracking-tighter">Settings</h1>
                        <button (click)="openCreate()" class="p-2 bg-indigo-600 text-white rounded-lg border-none cursor-pointer hover:bg-indigo-700 transition-colors">
                            <i class="pi pi-plus text-xs"></i>
                        </button>
                    </div>
                    <p-icon-field iconPosition="left">
                        <p-inputicon class="pi pi-search"/>
                        <input
                            type="text" pInputText [(ngModel)]="searchText" (ngModelChange)="onSearch($event)"
                            placeholder="Filter keys..." class="w-full pl-9 bg-slate-100 border-none rounded-lg py-2 text-sm" />
                    </p-icon-field>

                </div>

                <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    <ng-container *ngIf="loading">
                        <div *ngFor="let i of [1,2,3,4,5]" class="p-4 bg-white rounded-xl border border-slate-100">
                            <p-skeleton width="70%" height="1rem" styleClass="mb-2"></p-skeleton>
                            <p-skeleton width="40%" height="0.5rem"></p-skeleton>
                        </div>
                    </ng-container>

                    <div *ngIf="!loading">
                        <div *ngFor="let item of items" (click)="selectItem(item)"
                             [ngClass]="selectedItem?.id === item.id ? 'bg-white shadow-md border-indigo-200 ring-1 ring-indigo-100' : 'bg-transparent border-transparent hover:bg-slate-100'"
                             class="p-4 rounded-xl border cursor-pointer transition-all group">
                            <div class="flex justify-between items-start">
                                <div class="truncate pr-4">
                                    <p class="text-sm font-bold text-slate-700 font-mono truncate uppercase">{{ item.key }}</p>
                                    <p class="text-[10px] text-slate-400 mt-1 font-medium">{{ item.modifiedDate | date:'MMM d, HH:mm' }}</p>
                                </div>
                                <i class="pi pi-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-400"></i>
                            </div>
                        </div>

                        <div *ngIf="items.length === 0" class="text-center py-10 opacity-30">
                            <i class="pi pi-sliders-h text-3xl mb-2"></i>
                            <p class="text-xs font-bold uppercase">No records</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white border-t border-slate-200 p-2">
                    <p-paginator [rows]="pageSize" [totalRecords]="totalRecords" (onPageChange)="onPage($event)" styleClass="scale-75"></p-paginator>
                </div>
            </div>

            <div class="flex-1 flex flex-col bg-white">
                <ng-container *ngIf="selectedItem; else emptyState">
                    <div class="h-20 px-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold">
                                {{ selectedItem.key?.charAt(0) }}
                            </div>
                            <div>
                                <h2 class="text-lg font-black text-slate-800 font-mono uppercase">{{ selectedItem.key }}</h2>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Parameter</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button (click)="openEdit(selectedItem)" class="p-button-outlined p-button-secondary p-button-sm font-bold" pButton label="Edit Value"></button>
                        </div>
                    </div>

                    <div class="flex-1 p-10 overflow-y-auto">
                        <div class="max-w-4xl space-y-8">
                            <div class="p-8 bg-slate-50 rounded-3xl border border-slate-100 relative">
                                <span class="absolute top-4 right-6 text-[9px] font-black text-slate-300 uppercase tracking-tighter">Value Buffer</span>
                                <pre class="text-sm font-mono text-slate-600 leading-relaxed whitespace-pre-wrap break-all">{{ selectedItem.value }}</pre>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</p>
                                    <p class="text-xs font-bold text-slate-600">{{ selectedItem.createdDate | date:'long' }}</p>
                                </div>
                                <div class="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Modified</p>
                                    <p class="text-xs font-bold text-slate-600">{{ selectedItem.modifiedDate | date:'long' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>

                <ng-template #emptyState>
                    <div class="flex-1 flex flex-col items-center justify-center text-slate-300" *ngIf="!loading">
                        <i class="pi pi-cog text-6xl mb-4 opacity-20"></i>
                        <p class="text-sm font-black uppercase tracking-widest">Select a key to view configuration</p>
                    </div>

                    <div *ngIf="loading" class="p-10 space-y-6">
                        <p-skeleton width="40%" height="3rem"></p-skeleton>
                        <p-skeleton width="100%" height="20rem" styleClass="rounded-3xl"></p-skeleton>
                    </div>
                </ng-template>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-dialog-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }
            .p-dialog-footer { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; }
            .p-inputtext:focus { box-shadow: none; border-color: #6366f1; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemConfigurationComponent implements OnInit, OnDestroy {
    items: SystemConfiguration[] = [];
    selectedItem: SystemConfiguration | null = null;
    loading = true;
    isSaving = false;

    displayDialog = false;
    editingConfig: SystemConfiguration | null = null;

    searchText = '';
    totalRecords = 0;
    pageSize = 10;
    pageIndex = 0;

    private _searchSub = new Subject<string>();
    private _destroy = new Subject<void>();

    constructor(
        private _service: SystemConfigurationService,
        private _cdr: ChangeDetectorRef,
        private _toast: MessageService
    ) {}

    ngOnInit(): void {
        this._searchSub.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this._destroy))
            .subscribe(() => { this.pageIndex = 0; this.load(); });
        this.load();
    }

    load(): void {
        this.loading = true;
        const filter: SearchFilter = {
            paginationFilter: { pageNumber: this.pageIndex, pageSize: this.pageSize },
            search: { value: this.searchText },
            order: { column: 'key', direction: 'asc' }
        };

        this._service.searchSystemConfiguration(filter)
            .pipe(takeUntil(this._destroy), finalize(() => { this.loading = false; this._cdr.markForCheck(); }))
            .subscribe((res: any) => {
                // Adjusting based on common API wrapper structures
                this.items = res.payload?.data || res || [];
                this.totalRecords = res.payload?.totalRecords || this.items.length;
            });
    }

    selectItem(item: SystemConfiguration): void {
        this.selectedItem = item;
    }

    openCreate(): void {
        this.editingConfig = { key: '', value: '' };
        this.displayDialog = true;
    }

    openEdit(item: SystemConfiguration): void {
        this.editingConfig = { ...item };
        this.displayDialog = true;
    }

    onSave(): void {
        if (!this.editingConfig?.key || !this.editingConfig?.value) {
            this._toast.add({ severity: 'warn', summary: 'Required', detail: 'Fill all fields' });
            return;
        }

        this.isSaving = true;
        const obs = this.editingConfig.id
            ? this._service.updateSystemConfiguration(this.editingConfig.id, this.editingConfig)
            : this._service.addSystemConfiguration(this.editingConfig);

        obs.pipe(finalize(() => { this.isSaving = false; this._cdr.markForCheck(); }))
            .subscribe(() => {
                this._toast.add({ severity: 'success', summary: 'Success', detail: 'Configuration saved' });
                this.displayDialog = false;
                this.load();
            });
    }

    onSearch(v: string): void { this._searchSub.next(v); }
    onPage(e: any): void { this.pageIndex = e.page; this.load(); }
    ngOnDestroy(): void { this._destroy.next(); this._destroy.complete(); }
}
