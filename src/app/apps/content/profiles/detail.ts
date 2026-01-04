import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from "rxjs";

// PrimeNG Imports
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { SkeletonModule } from "primeng/skeleton";
import { TagModule } from "primeng/tag";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { PaginatorModule } from "primeng/paginator";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { SelectModule } from "primeng/select";
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem, ConfirmationService, MessageService } from "primeng/api";

// Types & Services
import { ContentSource } from "@/apps/content/content.types";
import { PersonalContentService } from "@/apps/content/content.service";
import { PaginationFilter, SearchFilter } from "@/core/pagination/personal-book.pagination";

@Component({
    selector: 'app-content-profile-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TableModule,
        ButtonModule, InputTextModule, DialogModule, ToastModule, ConfirmDialogModule,
        SkeletonModule, TagModule, ToggleSwitchModule, PaginatorModule,
        IconFieldModule, InputIconModule, SelectModule, TieredMenuModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast position="bottom-right"></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
            <div class="p-8 bg-white border-b border-slate-200 shrink-0">
                <div class="flex items-center gap-4 mb-4">
                    <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-secondary p-button-sm" routerLink="/apps/content/profiles"></button>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Intelligence Profile</span>
                </div>

                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-3xl font-black text-slate-900 tracking-tighter">
                            {{ profileDetail?.name || 'Profile Sources' }}
                        </h1>
                        <p class="text-slate-500 font-medium">Manage automation endpoints for key: <code class="bg-slate-100 px-2 rounded text-indigo-600">{{profileDetail?.key}}</code></p>
                    </div>

                    <div class="flex gap-3">
                        <button pButton icon="pi pi-cog" label="Actions"
                                class="p-button-outlined p-button-secondary rounded-xl font-bold"
                                (click)="menu.toggle($event)"></button>
                        <p-tieredMenu #menu [model]="profileActions" [popup]="true"></p-tieredMenu>

                        <button pButton label="Add New Source" icon="pi pi-plus"
                                class="p-button-primary rounded-xl px-6 font-bold shadow-lg shadow-indigo-100"
                                (click)="openCreateDialog()"></button>
                    </div>
                </div>
            </div>

            <div class="px-8 py-4 bg-white/50 border-b border-slate-100">
                <p-icon-field iconPosition="left">
                    <p-inputicon class="pi pi-search"></p-inputicon>
                    <input type="text" pInputText placeholder="Filter these sources..."
                           [(ngModel)]="searchText" (ngModelChange)="onSearchChange($event)"
                           class="w-full md:w-96 border-none bg-white rounded-xl py-3 text-sm shadow-sm"/>
                </p-icon-field>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="mx-auto">
                    <p-table [value]="sources" [loading]="loading" class="pb-source-table">
                        <ng-template pTemplate="header">
                            <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                                <th class="pb-4 px-4 w-16">Status</th>
                                <th class="pb-4">Source Info</th>
                                <th class="pb-4">Type</th>
                                <th class="pb-4">Endpoint</th>
                                <th class="pb-4 text-right pr-4">Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-source>
                            <tr class="bg-white hover:shadow-md transition-all group mt-4">
                                <td class="py-6 px-4 first:rounded-l-3xl">
                                    <p-toggle-switch [(ngModel)]="source.enabled" (onChange)="toggleSource(source)"></p-toggle-switch>
                                </td>
                                <td class="py-6">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-slate-800">{{source.name}}</span>
                                        <span class="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">{{source.topic || 'General'}}</span>
                                    </div>
                                </td>
                                <td class="py-6">
                                    <p-tag [value]="source.type" [severity]="getSourceSeverity(source.type)"></p-tag>
                                </td>
                                <td class="py-6">
                                    <span class="text-xs font-mono text-slate-400 truncate max-w-[200px] block">
                                        {{source.endpoint}}
                                    </span>
                                </td>
                                <td class="py-6 last:rounded-r-3xl text-right pr-4">
                                    <div class="flex justify-end gap-1">
                                        <button pButton icon="pi pi-pencil" title="Edit"
                                                class="p-button-text p-button-secondary p-button-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                (click)="editSource(source)"></button>
                                        <button pButton icon="pi pi-trash" title="Delete"
                                                class="p-button-text p-button-danger p-button-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                (click)="deleteSource(source.id)"></button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="h-3"></tr>
                        </ng-template>
                    </p-table>

                    <div *ngIf="!loading && sources.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <i class="pi pi-database text-4xl text-slate-200 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-900">No sources found</h3>
                        <p class="text-slate-400">Add a source to start pulling data for this profile.</p>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-between items-center px-8">
                <span class="text-xs font-bold text-slate-400 uppercase">Total: {{totalRecords}} Sources</span>
                <p-paginator [rows]="pagination.pageSize" [totalRecords]="totalRecords"
                             (onPageChange)="onPageChange($event)"
                             styleClass="bg-transparent border-none"></p-paginator>
            </div>
        </div>

        <p-dialog [(visible)]="displayDialog" [modal]="true" [style]="{width: '550px'}"
                  [header]="editingSource?.id ? 'Update Content Source' : 'Connect New Source'"
                  [draggable]="false" [resizable]="false" class="pb-source-dialog">

            <div class="flex flex-col gap-5 py-4" *ngIf="editingSource">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase">Friendly Name</label>
                    <input pInputText [(ngModel)]="editingSource.name" placeholder="e.g. Primary Reddit Feed" class="w-full border-none bg-slate-50 rounded-xl p-4 font-bold"/>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase">Source Type</label>
                        <p-select [options]="sourceTypes" [(ngModel)]="editingSource.type" styleClass="w-full border-none bg-slate-50 rounded-xl"></p-select>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase">Category/Topic</label>
                        <input pInputText [(ngModel)]="editingSource.topic" placeholder="e.g. AI News" class="w-full border-none bg-slate-50 rounded-xl p-3 font-bold"/>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase">Connection Endpoint (URL)</label>
                    <input pInputText [(ngModel)]="editingSource.endpoint" placeholder="https://api.provider.com/v1/..." class="w-full border-none bg-slate-50 rounded-xl p-4 font-mono text-xs"/>
                </div>

                <div class="flex items-center gap-3 bg-indigo-50/50 p-4 rounded-2xl">
                    <p-toggle-switch [(ngModel)]="editingSource.enabled"></p-toggle-switch>
                    <span class="text-xs font-bold text-indigo-900">Enable this source immediately</span>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <button pButton label="Discard" class="p-button-text p-button-secondary font-bold" (click)="displayDialog = false"></button>
                <button pButton label="Confirm & Save" class="p-button-primary px-8 rounded-2xl font-black shadow-lg"
                        [loading]="isSaving" (click)="saveSource()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-table .p-datatable-tbody > tr > td { border: none; background: transparent; }
            .p-tag { font-size: 9px; font-weight: 900; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; }
            .p-dialog .p-dialog-header { border: none; padding-top: 2rem; }
            .p-dialog .p-dialog-content { border: none; }
            .p-dialog .p-dialog-footer { border: none; padding-bottom: 2rem; }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentProfileDetailComponent implements OnInit, OnDestroy {
    profileKey: string = '';
    id: string = "";
    profileDetail: any = null;

    sources: ContentSource[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    isSaving: boolean = false;
    displayDialog: boolean = false;
    editingSource: ContentSource | null = null;
    searchText: string = '';

    pagination: PaginationFilter = { pageNumber: 1, pageSize: 10 };
    sourceTypes = ['RSS', 'YouTube', 'API', 'Web Scrape', 'Reddit'];

    profileActions: MenuItem[] = [];
    private _searchSubject: Subject<string> = new Subject<string>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _contentService: PersonalContentService,
        private _messageService: MessageService,
        private _confirmationService: ConfirmationService,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.id = this._route.snapshot.params['id'];

        this.profileActions = [
            { label: 'Run Sync', icon: 'pi pi-refresh', command: () => this.runProfile() },
            { label: 'View Logs', icon: 'pi pi-book', command: () => this.viewLogs() },
            { separator: true },
            { label: 'Delete Profile', icon: 'pi pi-trash', styleClass: 'text-red-500' }
        ];

        this._searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => this.loadSources());

        this.loadProfileHeader();
    }

    loadProfileHeader(): void {
        this._contentService.getContentProfile(this.id)
            .subscribe((res: any) => {
                this.profileDetail = res.payload || res;
                this.loadSources();
                this._cdr.markForCheck();
            });
    }

    // CREATE (Open Dialog)
    openCreateDialog(): void {
        this.editingSource = {
            id: '',
            profileKey: this.profileDetail.key,
            name: '',
            type: 'RSS',
            endpoint: '',
            topic: '',
            enabled: true,
            settings: {},
            createdDate: new Date().toISOString(),
            isDeleted: false
        };
        this.displayDialog = true;
    }

    // READ
    loadSources(): void {
        this.loading = true;
        const filter: any = {
            paginationFilter: this.pagination,
            search: { value: this.searchText },
            profileKey : this.profileDetail.key
        };

        this._contentService.searchContentSources(filter)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => { this.loading = false; this._cdr.markForCheck(); })
            )
            .subscribe((res: any) => {
                const data = res.payload?.data || res.data || res || [];
                // Frontend filter to ensure we only see sources for THIS profile
                this.sources = data;
                this.totalRecords = this.sources.length;
            });
    }

    // UPDATE (Open Dialog)
    editSource(source: ContentSource): void {
        this.editingSource = { ...source };
        this.displayDialog = true;
    }

    // SAVE (C & U Logic)
    saveSource(): void {
        if (!this.editingSource) return;
        this.isSaving = true;

        const request = this.editingSource.id
            ? this._contentService.updateContentSources(this.editingSource.id, this.editingSource)
            : this._contentService.addContentSources(this.editingSource);

        request.pipe(finalize(() => { this.isSaving = false; this._cdr.markForCheck(); }))
            .subscribe(() => {
                this._messageService.add({ severity: 'success', summary: 'Source Saved' });
                this.displayDialog = false;
                this.loadSources();
            });
    }

    // TOGGLE STATUS
    toggleSource(source: ContentSource): void {
        this._contentService.updateContentSources(source.id, source).subscribe();
    }

    // DELETE
    deleteSource(id: string): void {
        this._confirmationService.confirm({
            message: 'Are you sure you want to delete this source?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._contentService.deleteContentSources(id).subscribe(() => {
                    this._messageService.add({ severity: 'warn', summary: 'Source Deleted' });
                    this.loadSources();
                });
            }
        });
    }

    runProfile(): void {
        this._messageService.add({ severity: 'info', summary: 'Sync Triggered' });
    }

    viewLogs(): void {
        console.log('Opening logs for profile:', this.profileKey);
    }

    getSourceSeverity(type: string): any {
        switch (type) {
            case 'RSS': return 'success';
            case 'YouTube': return 'danger';
            case 'API': return 'info';
            case 'Reddit': return 'warn';
            default: return 'secondary';
        }
    }

    onPageChange(event: any): void {
        this.pagination.pageNumber = event.page + 1;
        this.loadSources();
    }

    onSearchChange(v: string): void { this._searchSubject.next(v); }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
