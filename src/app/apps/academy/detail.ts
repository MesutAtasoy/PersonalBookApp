import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {finalize, Subject, takeUntil} from 'rxjs';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { AcademyService } from "@/apps/academy/academy.service";
import { Course, CourseStep } from "@/apps/academy/academy.types";

@Component({
    selector: 'app-academy-details',
    standalone: true,
    imports: [
        CommonModule, RouterModule, FormsModule, ButtonModule,
        SkeletonModule, DividerModule, ToastModule, DialogModule,
        InputTextModule, EditorModule, ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="flex h-screen w-full overflow-hidden bg-white">

            <aside class="w-80 flex flex-col border-r border-slate-200 bg-white shrink-0">

                <div class="p-6 pb-4 shrink-0">
                    <button (click)="goBack()" class="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-semibold mb-6 border-none bg-transparent cursor-pointer p-0">
                        <i class="pi pi-arrow-left mr-2 text-xs"></i>
                        Back to courses
                    </button>

                    <div *ngIf="loading" class="space-y-2">
                        <p-skeleton width="80%" height="1.5rem"></p-skeleton>
                        <p-skeleton width="60%" height="1rem"></p-skeleton>
                    </div>

                    <div *ngIf="!loading && course">
                        <h1 class="text-xl font-bold text-slate-900 leading-tight mb-1 truncate">{{ course.title }}</h1>
                        <p class="text-slate-500 text-sm leading-snug line-clamp-2">{{ course.description }}</p>
                    </div>
                </div>

                <div class="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30 shrink-0">
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Course Steps</span>
                    <button (click)="openStepDialog()" class="text-indigo-600 hover:bg-indigo-50 p-1 px-2 rounded-md transition-colors flex items-center text-xs font-bold border-none bg-transparent cursor-pointer">
                        <i class="pi pi-plus mr-1"></i> Add Step
                    </button>
                </div>

                <nav class="flex-1 overflow-y-auto custom-scrollbar relative px-6 py-4">
                    <div class="absolute left-[39px] top-0 bottom-0 w-px bg-slate-200 z-0"></div>

                    <div class="space-y-4">
                        <ng-container *ngIf="loading">
                            <div *ngFor="let i of [1,2,3,4,5]" class="flex items-center gap-4">
                                <p-skeleton shape="circle" size="32px" styleClass="shrink-0"></p-skeleton>
                                <div class="flex-1"><p-skeleton width="80%" height="1rem"></p-skeleton></div>
                            </div>
                        </ng-container>

                        <div *ngFor="let step of course?.steps; let i = index"
                             (click)="selectStep(i)"
                             class="flex items-center gap-4 cursor-pointer relative z-10 group">

                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0 border-2"
                                 [ngClass]="currentStepIndex === i ?
                            'bg-white border-indigo-600 text-indigo-600 shadow-sm' :
                            'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'">
                                {{ i + 1 }}
                            </div>

                            <div class="flex-1 min-w-0">
                                <h3 class="text-[13px] font-semibold truncate transition-colors"
                                    [ngClass]="currentStepIndex === i ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-900'">
                                    {{ step.title }}
                                </h3>
                                <p class="text-[11px] text-slate-400 truncate">{{ step.subtitle }}</p>
                            </div>
                        </div>
                    </div>
                </nav>

                <div class="p-4 border-t border-slate-100 text-[10px] text-slate-400 shrink-0 text-center">
                    Mesut Atasoy © 2025
                </div>
            </aside>

            <main class="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">

                <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
                    <h2 class="font-bold text-slate-800 truncate mr-4">
                        {{ loading ? 'Loading...' : (currentStep?.title || 'Overview') }}
                    </h2>
                    <div class="flex items-center gap-1" *ngIf="!loading && currentStep">
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm p-button-rounded" (click)="deleteStep(currentStep)"></button>
                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-secondary p-button-sm p-button-rounded" (click)="openStepDialog(currentStep)"></button>
                        <button pButton icon="pi pi-ellipsis-v" class="p-button-text p-button-secondary p-button-sm p-button-rounded"></button>
                    </div>
                </header>

                <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                    <div class="w-full">

                        <div *ngIf="loading" class="bg-white rounded-xl p-10 border border-slate-200 shadow-sm">
                            <p-skeleton width="40%" height="2rem" styleClass="mb-6"></p-skeleton>
                            <div class="space-y-3 mb-8">
                                <p-skeleton width="100%" height="1rem"></p-skeleton>
                                <p-skeleton width="85%" height="1rem"></p-skeleton>
                            </div>
                            <p-skeleton width="100%" height="25rem"></p-skeleton>
                        </div>

                        <article *ngIf="!loading && currentStep" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] animate-fade-in">

                            <div class="p-8 md:p-12 flex-1">
                                <div class="w-10 h-10 rounded bg-pink-500 text-white flex items-center justify-center font-bold mb-8">M</div>

                                <div class="prose prose-indigo max-w-none text-slate-700 break-words"
                                     [innerHTML]="currentStep.content">
                                </div>
                            </div>

                            <footer class="p-6 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-4">
                                <button (click)="selectStep(currentStepIndex - 1)"
                                        [disabled]="currentStepIndex === 0"
                                        class="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm shadow-md disabled:opacity-30 border-none cursor-pointer">
                                    <i class="pi pi-arrow-left text-xs"></i> Prev
                                </button>

                                <span class="text-xs font-extrabold text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                            {{ currentStepIndex + 1 }} / {{ course?.steps?.length || 0 }}
                        </span>

                                <button (click)="selectStep(currentStepIndex + 1)"
                                        [disabled]="currentStepIndex === (course?.steps?.length || 0) - 1"
                                        class="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-sm shadow-md disabled:opacity-30 border-none cursor-pointer">
                                    Next <i class="pi pi-arrow-right text-xs"></i>
                                </button>
                            </footer>
                        </article>

                    </div>
                </div>
            </main>
        </div>

        <p-dialog [(visible)]="stepDialog" [header]="editingStep.id ? 'Edit Step' : 'Add New Step'"
                  [modal]="true" [style]="{width: '850px'}" class="p-fluid" appendTo="body">
            <ng-template pTemplate="content">
                <div class="grid grid-cols-2 gap-4 mb-4 mt-2">
                    <div class="field">
                        <label class="font-bold block mb-2">Step Title</label>
                        <input type="text" pInputText [(ngModel)]="editingStep.title" placeholder="e.g. Introduction" />
                    </div>
                    <div class="field">
                        <label class="font-bold block mb-2">Subtitle</label>
                        <input type="text" pInputText [(ngModel)]="editingStep.subTitle" placeholder="e.g. Overview of module" />
                    </div>
                </div>
                <div class="field">
                    <label class="font-bold block mb-2">HTML Content</label>
                    <p-editor [(ngModel)]="editingStep.content" [style]="{ height: '350px' }"></p-editor>
                </div>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text text-slate-500" (click)="stepDialog = false"></button>
                <button pButton label="Save Step" icon="pi pi-check" [loading]="saving" (click)="saveStep()"></button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            /* Custom Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

            /* Typography & Formatting */
            .prose h1, .prose h2, .prose h3 { color: #1e293b; font-weight: 800; margin-top: 1.5em; }
            .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 1em; }
            .prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-top: 1em; }
            .prose li { margin-bottom: 0.5rem; }
            .prose pre { background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; }

            .p-editor-container .p-editor-content { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
            .p-editor-container .p-editor-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcademyDetailsComponent implements OnInit, OnDestroy {
    course: Course | null = null;
    currentStepIndex: number = 0;
    loading: boolean = true;
    saving: boolean = false;
    stepDialog: boolean = false;
    editingStep: Partial<CourseStep> = {};

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _academyService: AcademyService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _messageService: MessageService,
        private _confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this._academyService.course$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((course: Course) => {
                this.course = course;
                this.loading = false;
                this._cdr.markForCheck();
            });

        const id = this._activatedRoute.snapshot.paramMap.get('id');
        if (id) {
            this.loading = true;
            this._academyService.getCourseById(id).subscribe();
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    get currentStep(): CourseStep | undefined {
        return this.course?.steps?.[this.currentStepIndex];
    }

    selectStep(index: number): void {
        if (index < 0 || index >= (this.course?.steps?.length || 0)) return;
        this.currentStepIndex = index;
        const scrollEl = document.querySelector('.flex-1.overflow-y-auto');
        if (scrollEl) scrollEl.scrollTop = 0;
        this._cdr.markForCheck();
    }

    openStepDialog(step?: CourseStep): void {
        this.editingStep = step ? { ...step } : { title: '', subTitle: '', content: '' };
        this.stepDialog = true;
    }

    saveStep(): void {
        if (!this.editingStep.title) return;
        this.saving = true;

        const request$ = this.editingStep.id
            ? this._academyService.updateCourseStep(this.editingStep.id, this.editingStep as any)
            : this._academyService.addCourseStep({ ...this.editingStep, courseId: this.course?.id } as any);

        request$.pipe(finalize(() => { this.saving = false; this._cdr.markForCheck(); }))
            .subscribe(() => {
                this._messageService.add({ severity: 'success', summary: 'Saved' });
                this.stepDialog = false;
                this.ngOnInit();
            });
    }

    deleteStep(step: CourseStep): void {
        this._confirmationService.confirm({
            header: 'Delete Step',
            message: `Are you sure you want to remove "${step.title}"?`,
            accept: () => {
                this._academyService.deleteCourseStep(step.id!).subscribe(() => {
                    this._messageService.add({ severity: 'info', summary: 'Deleted' });
                    this.currentStepIndex = 0;
                    this.ngOnInit();
                });
            }
        });
    }

    goBack(): void {
        this._router.navigate(['/apps/academy']);
    }
}
