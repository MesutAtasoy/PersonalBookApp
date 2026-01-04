import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from "rxjs";

// PrimeNG
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { InputTextModule } from "primeng/inputtext";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { PaginatorModule } from "primeng/paginator";
import { SkeletonModule } from "primeng/skeleton";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

// Models & Services
import { ContentLog } from "@/apps/content/content.types";
import { PersonalContentService } from "@/apps/content/content.service";
import { PaginationFilter, SearchFilter } from "@/core/pagination/personal-book.pagination";

@Component({
    selector: 'app-content-logs-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule, TableModule, TagModule,
        InputTextModule, IconFieldModule, InputIconModule, PaginatorModule,
        SkeletonModule, ButtonModule, TooltipModule
    ],
    template: `
        <div class="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
            <div class="p-8 bg-white border-b border-slate-200 shrink-0">
                <div class="flex justify-between items-end">
                    <div>
                        <h1 class="text-3xl font-black text-slate-900 tracking-tighter">Execution Logs</h1>
                        <p class="text-slate-500 font-medium">
                            <span *ngIf="profileKeyFilter">
                                Showing events for profile: <b class="text-indigo-600">{{profileKeyFilter}}</b>
                            </span>
                            <span *ngIf="!profileKeyFilter">System-wide execution history</span>
                        </p>
                    </div>

                    <div class="flex gap-3">
                        <p-icon-field iconPosition="left">
                            <p-inputicon class="pi pi-search"></p-inputicon>
                            <input type="text" pInputText placeholder="Search log messages..."
                                   [(ngModel)]="searchText" (ngModelChange)="onSearchChange($event)"
                                   class="w-80 border-none bg-slate-100 rounded-xl py-3 text-sm"/>
                        </p-icon-field>
                        <button pButton icon="pi pi-refresh" class="p-button-secondary p-button-text rounded-xl" (click)="loadLogs()"></button>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="mx-auto">

                    <div *ngIf="loading" class="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100">
                        <p-table [value]="[1,2,3,4,5,6]">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="width: 20%"><p-skeleton width="80%"></p-skeleton></th>
                                    <th style="width: 15%"><p-skeleton width="80%"></p-skeleton></th>
                                    <th style="width: 15%"><p-skeleton width="80%"></p-skeleton></th>
                                    <th><p-skeleton width="80%"></p-skeleton></th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body">
                                <tr>
                                    <td><p-skeleton width="90%" height="1.5rem"></p-skeleton></td>
                                    <td><p-skeleton width="70%" height="1.5rem"></p-skeleton></td>
                                    <td><p-skeleton width="60%" height="1.5rem"></p-skeleton></td>
                                    <td><p-skeleton width="100%" height="1.5rem"></p-skeleton></td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>

                    <p-table *ngIf="!loading" [value]="logs" styleClass="p-datatable-sm" [responsiveLayout]="'scroll'">
                        <ng-template pTemplate="header">
                            <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th class="pb-4">Timestamp</th>
                                <th class="pb-4">Level</th>
                                <th class="pb-4">Source</th>
                                <th class="pb-4">Message</th>
                                <th class="pb-4">Run ID</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-log>
                            <tr class="bg-white hover:bg-slate-50 transition-colors cursor-default border-b border-slate-50">
                                <td class="py-4 text-xs font-medium text-slate-600">
                                    {{ log.createdDate | date:'MMM d, HH:mm:ss' }}
                                </td>
                                <td class="py-4">
                                    <p-tag [value]="log.severity || 'INFO'"
                                           [severity]="getSeverity(log.severity)"
                                           styleClass="text-[9px] px-2 font-black"></p-tag>
                                </td>
                                <td class="py-4">
                                    <span class="text-xs font-bold text-slate-700">{{ log.sourceName || 'System' }}</span>
                                    <div class="text-[9px] text-slate-400 leading-none">{{ log.profileKey }}</div>
                                </td>
                                <td class="py-4">
                                    <span class="text-xs text-slate-600 leading-relaxed">{{ log.message }}</span>
                                </td>
                                <td class="py-4">
                                    <span class="text-[10px] font-mono text-slate-300 bg-slate-50 px-2 py-1 rounded"
                                          [pTooltip]="log.runId" tooltipPosition="left">
                                        {{ log.runId | slice:0:8 }}...
                                    </span>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>

                    <div *ngIf="!loading && logs.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <i class="pi pi-inbox text-4xl text-slate-200 mb-4"></i>
                        <h3 class="text-xl font-bold text-slate-900">No logs found</h3>
                        <p class="text-slate-400">Execution records will appear here once profiles are triggered.</p>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-center">
                <p-paginator [rows]="pagination.pageSize" [totalRecords]="totalRecords"
                             [rowsPerPageOptions]="[10, 20, 50, 100]" (onPageChange)="onPageChange($event)"
                             styleClass="bg-transparent border-none"></p-paginator>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentLogsListComponent implements OnInit, OnDestroy {
    logs: ContentLog[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    searchText: string = '';
    profileKeyFilter: string | null = null;

    pagination: PaginationFilter = { pageNumber: 1, pageSize: 20 };

    private _searchSubject: Subject<string> = new Subject<string>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _contentService: PersonalContentService,
        private _route: ActivatedRoute,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // 1. Listen for Query Parameter changes (e.g., ?profileKey=XYZ)
        this._route.queryParamMap.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe(params => {
            this.profileKeyFilter = params.get('profileKey');
            this.pagination.pageNumber = 1; // Reset to page 1 on filter change
            this.loadLogs();
        });

        // 2. Setup Search Debounce
        this._searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.pagination.pageNumber = 1;
            this.loadLogs();
        });
    }

    loadLogs(): void {
        this.loading = true;
        this._cdr.markForCheck();

        const filter: any = {
            paginationFilter: this.pagination,
            search: { value: this.searchText },
            // Add custom filter logic if your backend supports specific keys
            // or we filter the payload in the subscribe block
        };

        if(this.profileKeyFilter){
            filter.profileKey = this.profileKeyFilter
        };

        this._contentService.searchContentLogs(filter)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.loading = false;
                    this._cdr.markForCheck();
                })
            )
            .subscribe((res: any) => {
                let data = res.payload?.data || res || [];

                // Frontend filtering for profileKey if backend doesn't handle it via SearchFilter
                if (this.profileKeyFilter) {
                    data = data.filter((l: ContentLog) => l.profileKey === this.profileKeyFilter);
                }

                this.logs = data;
                this.totalRecords = res.payload?.totalCount || this.logs.length;
            });
    }

    getSeverity(severity: string | undefined): "success" | "info" | "warn" | "danger" | "secondary" {
        switch (severity?.toLowerCase()) {
            case 'error': return 'danger';
            case 'warning': return 'warn';
            case 'success': return 'success';
            case 'info': return 'info';
            default: return 'secondary';
        }
    }

    onPageChange(event: any): void {
        this.pagination.pageNumber = event.page + 1;
        this.pagination.pageSize = event.rows;
        this.loadLogs();
    }

    onSearchChange(v: string): void {
        this._searchSubject.next(v);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
