import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Subject, takeUntil, finalize, debounceTime, distinctUntilChanged} from "rxjs";

// PrimeNG
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {DialogModule} from "primeng/dialog";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {InputNumberModule} from "primeng/inputnumber";
import {SkeletonModule} from "primeng/skeleton";
import {TagModule} from "primeng/tag";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {TooltipModule} from "primeng/tooltip";
import {PaginatorModule} from "primeng/paginator";
import {SelectModule} from "primeng/select";
import {ChipModule} from "primeng/chip";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {MenuModule} from "primeng/menu";
import {ConfirmationService, MessageService, MenuItem} from "primeng/api";

// Services & Types
import {ContentProfile} from "@/apps/content/content.types";
import {PaginationFilter, SearchFilter} from "@/core/pagination/personal-book.pagination";
import {PersonalContentService} from "@/apps/content/content.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-content-profiles',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule,
        InputTextModule, DialogModule, ToastModule, ConfirmDialogModule,
        ToggleSwitchModule, ChipModule, SelectModule, InputNumberModule,
        SkeletonModule, TagModule, IconFieldModule, InputIconModule, TooltipModule,
        PaginatorModule, MenuModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-right"></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <p-menu #menu [model]="rowMenuItems" [popup]="true" appendTo="body"></p-menu>

        <div class="flex flex-col h-full bg-white font-sans overflow-hidden">
            <div class="p-8 border-b border-slate-100 flex justify-between items-end shrink-0">
                <div>
                    <h1 class="text-4xl font-black text-slate-900 tracking-tighter">Content Intelligence</h1>
                    <p class="text-slate-400 font-medium mt-1">AI-driven profiles and automation for Mesut Atasoy.</p>
                </div>
                <div class="flex gap-3">
                    <p-icon-field iconPosition="left">
                        <p-inputicon class="pi pi-search"></p-inputicon>
                        <input type="text" pInputText placeholder="Search profiles..."
                               [(ngModel)]="searchText" (ngModelChange)="onSearchChange($event)"
                               class="w-64 border-none bg-slate-100 rounded-xl py-3 text-sm"/>
                    </p-icon-field>
                    <button pButton label="New Profile" icon="pi pi-plus"
                            class="p-button-primary rounded-xl px-6 font-bold shadow-lg shadow-indigo-100"
                            (click)="openCreateDialog()"></button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
                <div class="mx-auto">
                    <div *ngIf="loading" class="space-y-4">
                        <div *ngFor="let i of [1,2,3,4,5]" class="flex gap-4 bg-slate-50 rounded-2xl">
                            <p-skeleton size="3rem" shape="circle"></p-skeleton>
                            <div class="flex-1 space-y-2">
                                <p-skeleton width="30%" height="1.5rem"></p-skeleton>
                                <p-skeleton width="15%"></p-skeleton>
                            </div>
                        </div>
                    </div>

                    <p-table *ngIf="!loading" [value]="profiles" [customSort]="true" (onSort)="onSort($event)"
                             responsiveLayout="scroll" class="pb-table-modern">
                        <ng-template pTemplate="header">
                            <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <th class="w-12">Status</th>
                                <th pSortableColumn="name">Profile Name
                                    <p-sortIcon field="name"></p-sortIcon>
                                </th>
                                <th pSortableColumn="schedule">Schedule
                                    <p-sortIcon field="schedule"></p-sortIcon>
                                </th>
                                <th>AI Config</th>
                                <th>Topics</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-profile>
                            <tr class="group border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                <td>
                                    <div
                                        [ngClass]="profile.enabled ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300'"
                                        class="w-2.5 h-2.5 rounded-full shadow-lg"></div>
                                </td>
                                <td>
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-800">{{ profile.name }}</span>
                                        <span
                                            class="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{{ profile.key }}</span>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        class="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase">
                                        {{ profile.schedule }}
                                    </span>
                                </td>
                                <td>
                                    <p-tag [severity]="profile.ai.enabled ? 'success' : 'secondary'"
                                           [value]="profile.ai.model"
                                           styleClass="text-[8px] font-black uppercase px-2"></p-tag>
                                </td>
                                <td>
                                    <div class="flex gap-1 max-w-[180px] overflow-hidden">
                                        <span *ngFor="let topic of profile.topics | slice:0:2"
                                              class="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
                                            {{ topic }}
                                        </span>
                                    </div>
                                </td>
                                <td class="text-right">
                                    <button pButton icon="pi pi-ellipsis-v"
                                            class="p-button-text p-button-rounded p-button-secondary"
                                            (click)="toggleMenu($event, menu, profile)"></button>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>

            <div class="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-center">
                <p-paginator [rows]="pagination.pageSize" [totalRecords]="totalRecords"
                             [rowsPerPageOptions]="[10, 20, 50]" (onPageChange)="onPageChange($event)"
                             styleClass="bg-transparent border-none"></p-paginator>
            </div>
        </div>

        <p-dialog [(visible)]="displayDialog" [modal]="true" [style]="{width: '900px'}"
                  [header]="editingProfile?.id ? 'Edit Content Profile' : 'Create Content Profile'"
                  [draggable]="false" [resizable]="false" class="pb-upsert-dialog">

            <div class="flex flex-col gap-8 py-4" *ngIf="editingProfile">

                <div class="section-container">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-cog text-indigo-500"></i> General Configuration
                        </h3>
                        <div class="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
                            <span class="text-xs font-bold text-slate-500">Enabled</span>
                            <p-toggle-switch [(ngModel)]="editingProfile.enabled"></p-toggle-switch>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Profile
                                Name</label>
                            <input pInputText [(ngModel)]="editingProfile.name"
                                   class="w-full border-none bg-slate-50 rounded-xl p-3 font-bold"/>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">System
                                Key</label>
                            <input pInputText [(ngModel)]="editingProfile.key"
                                   class="w-full border-none bg-slate-50 rounded-xl p-3 font-mono text-xs"/>
                        </div>

                        <div class="flex flex-col gap-2 col-span-2 mt-2">
                            <label
                                class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Topics</label>
                            <div class="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl min-h-[48px]">
                                <p-chip *ngFor="let t of editingProfile.topics; let i = index" [label]="t"
                                        [removable]="true" (onRemove)="removeTag(i, editingProfile.topics)"
                                        class="custom-tag"></p-chip>
                                <input type="text" placeholder="Add topic..."
                                       (keydown.enter)="addTag($event, editingProfile.topics)"
                                       class="flex-1 bg-transparent border-none outline-none text-sm p-1 font-bold text-slate-700"/>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 col-span-2">
                            <label
                                class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Keywords</label>
                            <div class="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl min-h-[48px]">
                                <p-chip *ngFor="let k of editingProfile.keywords; let i = index" [label]="k"
                                        [removable]="true" (onRemove)="removeTag(i, editingProfile.keywords)"
                                        class="keyword-tag"></p-chip>
                                <input type="text" placeholder="Add keyword..."
                                       (keydown.enter)="addTag($event, editingProfile.keywords)"
                                       class="flex-1 bg-transparent border-none outline-none text-sm p-1 font-bold text-slate-700"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-container border-l-4"
                     [ngClass]="editingProfile.ai.enabled ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/50'">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <i class="pi pi-bolt"
                               [ngClass]="editingProfile.ai.enabled ? 'text-amber-500' : 'text-slate-400'"></i> AI
                            Settings
                        </h3>
                        <p-toggle-switch [(ngModel)]="editingProfile.ai.enabled"></p-toggle-switch>
                    </div>
                    <div class="grid grid-cols-2 gap-4 transition-all"
                         [ngStyle]="{'opacity': editingProfile.ai.enabled ? '1' : '0.4', 'pointer-events': editingProfile.ai.enabled ? 'auto' : 'none'}">
                        <div class="flex flex-col gap-2">
                            <label
                                class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Model</label>
                            <p-select [options]="aiModels" [(ngModel)]="editingProfile.ai.model" optionLabel="label"
                                      optionValue="value" appendTo="body"
                                      styleClass="w-full border-none bg-white rounded-xl shadow-sm"></p-select>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">API
                                Key</label>
                            <input pInputText type="password" [(ngModel)]="editingProfile.ai.key"
                                   class="w-full border-none bg-white rounded-xl p-3 text-sm shadow-sm"/>
                        </div>
                    </div>
                </div>

                <div class="section-container">
                    <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i class="pi pi-bell text-emerald-500"></i> Notification Settings
                    </h3>
                    <div class="grid grid-cols-3 gap-6 items-center">
                        <div
                            class="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-700">Phone (SMS/Push)</span>
                                <span class="text-[9px] text-slate-400 uppercase font-bold">Mobile Alerts</span>
                            </div>
                            <p-toggle-switch
                                [(ngModel)]="editingProfile.notificationSettings.phoneNotification"></p-toggle-switch>
                        </div>

                        <div
                            class="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-700">Email Digest</span>
                                <span class="text-[9px] text-slate-400 uppercase font-bold">Inbox Delivery</span>
                            </div>
                            <p-toggle-switch
                                [(ngModel)]="editingProfile.notificationSettings.emailNotification"></p-toggle-switch>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Execution
                                Schedule (Cron)</label>
                            <input pInputText [(ngModel)]="editingProfile.schedule"
                                   class="w-full border-none bg-slate-50 rounded-xl p-3 font-mono text-xs text-indigo-600 font-bold"
                                   placeholder="0 0 * * *"/>
                        </div>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Discard" class="p-button-text p-button-secondary font-bold"
                        (click)="displayDialog = false"></button>
                <button pButton label="Save Profile" class="p-button-primary px-10 rounded-2xl font-black shadow-lg"
                        [loading]="isSaving" (click)="saveProfile()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-datatable.pb-table-modern .p-datatable-thead > tr > th {
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 10px;
                padding: 1.5rem 1rem;
            }

            .p-datatable.pb-table-modern .p-datatable-tbody > tr > td {
                border: none;
                padding: 1.25rem 1rem;
            }

            .p-paginator {
                border-radius: 16px;
                border: none;
            }

            .custom-tag .p-chip {
                background: #f1f5f9 !important;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                border-radius: 8px;
            }

            .keyword-tag .p-chip {
                background: #6366f1 !important;
                color: white !important;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                border-radius: 8px;
            }

            .p-chip-remove-icon {
                font-size: 8px !important;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentProfilesComponent implements OnInit, OnDestroy {
    profiles: ContentProfile[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    isSaving: boolean = false;
    displayDialog: boolean = false;
    editingProfile: ContentProfile | null = null;
    searchText: string = '';

    rowMenuItems: MenuItem[] = [];
    selectedProfileForMenu: ContentProfile | null = null;

    pagination: PaginationFilter = {pageNumber: 1, pageSize: 10};
    sortOrder: any = {column: 'name', direction: 'asc'};

    aiModels = [
        {label: 'GPT-5.2 (Deep Reasoning)', value: 'gpt-5.2-thinking', detail: 'Complex logic'},
        {label: 'Claude 4.5 Opus', value: 'claude-4.5-opus', detail: 'Creative writing'},
        {label: 'Gemini 3 Pro', value: 'gemini-3-pro', detail: 'Google ecosystem'}
    ];

    formats = ['JSON', 'Markdown', 'HTML', 'RSS'];

    private _searchSubject: Subject<string> = new Subject<string>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _contentService: PersonalContentService,
        private _messageService: MessageService,
        private _confirmationService: ConfirmationService,
        private _cdr: ChangeDetectorRef,
        public _router: Router,
    ) {
    }

    ngOnInit(): void {
        this.initializeMenuItems();
        this._searchSubject.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.pagination.pageNumber = 1;
                this.loadProfiles();
            });
        this.loadProfiles();
    }

    initializeMenuItems(): void {
        this.rowMenuItems = [
            {label: 'Edit', icon: 'pi pi-pencil', command: () => this.editProfile(this.selectedProfileForMenu!)},
            {label: 'Detail', icon: 'pi pi-eye', command: () => this.detailProfile(this.selectedProfileForMenu!)},
            {label: 'Run Now', icon: 'pi pi-play', command: () => this.runManual(this.selectedProfileForMenu!)},
            {separator: true},
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                styleClass: 'text-red-500',
                command: () => this.deleteProfile(this.selectedProfileForMenu!.id)
            }
        ];
    }

    loadProfiles(): void {
        this.loading = true;
        const filter: SearchFilter = {
            paginationFilter: this.pagination,
            search: {value: this.searchText},
            order: this.sortOrder
        };
        this._contentService.searchContentProfiles(filter).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.loading = false;
            this._cdr.markForCheck();
        }))
            .subscribe((res: any) => {
                this.profiles = res.payload?.data || res || [];
                this.totalRecords = res.payload?.totalRecords || this.profiles.length;
            });
    }

    openCreateDialog(): void {
        this.editingProfile = {
            id: '',
            key: '',
            name: '',
            enabled: true,
            schedule: '0 0 * * *',
            topics: [],
            keywords: [],
            notificationSettings: {
                phoneNotification: false,
                emailNotification: true
            },
            ai: {
                enabled: true,
                model:'gpt-5.2-thinking',
                key:''
            }
        }
        ;
        this.displayDialog = true;
    }

    editProfile(profile: ContentProfile): void {
        this.editingProfile = JSON.parse(JSON.stringify(profile)); // Deep copy
        this.displayDialog = true;
    }

    detailProfile(profile: ContentProfile): void {
        this._router.navigate(['apps/content/profiles/' + profile.id + '/detail']);

    }

    saveProfile(): void {
        if (!this.editingProfile) return;
        this.isSaving = true;
        const request = this.editingProfile.id ? this._contentService.updateContentProfile(this.editingProfile.id, this.editingProfile) : this._contentService.addContentProfile(this.editingProfile);
        request.pipe(finalize(() => {
            this.isSaving = false;
            this._cdr.markForCheck();
        }))
            .subscribe(() => {
                this._messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Profile saved successfully'
                });
                this.displayDialog = false;
                this.loadProfiles();
            });
    }

    deleteProfile(id: string): void {
        this._confirmationService.confirm({
            message: 'Are you sure you want to delete this profile?',
            accept: () => {
                this._contentService.deleteContentProfile(id).subscribe(() => {
                    this._messageService.add({severity: 'warn', summary: 'Deleted', detail: 'Profile removed'});
                    this.loadProfiles();
                });
            }
        });
    }

    toggleMenu(event: any, menu: any, profile: ContentProfile): void {
        this.selectedProfileForMenu = profile;
        menu.toggle(event);
    }

    runManual(profile: ContentProfile): void {
        this._confirmationService.confirm({
            message: 'Are you sure you want to run manual this profile?',
            accept: () => {
                this._contentService.ingestManuallyContentProfile(profile.id).subscribe(() => {
                    this._messageService.add({severity: 'info', summary: 'Executing', detail: `Triggered ${profile.name}`});
                    this.loadProfiles();
                });
            }
        });
    }

    onPageChange(event: any): void {
        this.pagination.pageNumber = event.page + 1;
        this.pagination.pageSize = event.rows;
        this.loadProfiles();
    }

    onSort(event: any): void {
        this.sortOrder = {column: event.field, direction: event.order === 1 ? 'asc' : 'desc'};
        this.loadProfiles();
    }

    onSearchChange(v: string): void {
        this._searchSubject.next(v);
    }

    addTag(event: any, targetArray: string[]): void {
        const input = event.target as HTMLInputElement;
        const value = input.value.trim();
        if (value && !targetArray.includes(value)) targetArray.push(value);
        input.value = '';
        event.preventDefault();
    }

    removeTag(index: number, targetArray: string[]): void {
        targetArray.splice(index, 1);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
