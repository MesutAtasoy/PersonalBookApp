import { Component, computed, inject, OnInit } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LayoutService } from '@/layout/service/layout.service';
import { AppConfigurator } from '@/layout/components/app.configurator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from "@/core/auth/auth.service";
import {MessageModule} from "primeng/message";
import {Toast, ToastModule} from "primeng/toast";
import {NgClass, NgIf} from "@angular/common";
import {Ripple} from "primeng/ripple";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CheckboxModule,
        InputTextModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AppConfigurator,
        IconFieldModule,
        InputIconModule,
        ButtonModule,
        MessageModule,
        ToastModule,
        NgClass,
        Ripple,
        NgIf,
    ],
    template: `
        <p-toast position="top-right"></p-toast>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1600 800"
            class="fixed left-0 top-0 min-h-screen min-w-screen"
            preserveAspectRatio="none"
        >
            <rect
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-900)' : 'var(--p-primary-500)'
                "
                width="1600"
                height="800"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-800)' : 'var(--p-primary-400)'
                "
                d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-700)' : 'var(--p-primary-300)'
                "
                d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-600)' : 'var(--p-primary-200)'
                "
                d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-500)' : 'var(--p-primary-100)'
                "
                d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"
            />
        </svg>
        <div class="px-8 min-h-screen flex justify-center items-center">
            <div
                class="border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded py-16 px-6 md:px-16 z-10">
                <div class="mb-6">
                    <div class="text-surface-900 dark:text-surface-0 text-xl font-bold mb-2">
                        Log in
                    </div>
                    <span class="text-surface-600 dark:text-surface-200 font-medium">Please enter your details</span>
                </div>

                <form [formGroup]="signInForm" (ngSubmit)="signIn()" class="flex flex-col">
                    <p-iconfield class="w-full mb-6">
                        <p-inputicon class="pi pi-user"/>
                        <input
                            id="username"
                            type="text"
                            pInputText
                            formControlName="username"
                            class="w-full md:w-100"
                            placeholder="Username"
                            [ngClass]="{'p-invalid': signInForm.get('username')?.invalid && signInForm.get('username')?.touched}"
                        />
                    </p-iconfield>
                    <small *ngIf="signInForm.get('username')?.invalid && signInForm.get('username')?.touched"
                           class="p-error block mb-4">
                        Username is required
                    </small>

                    <p-iconfield class="w-full mb-6">
                        <p-inputicon class="pi pi-lock"/>
                        <input
                            id="password"
                            type="password"
                            pInputText
                            formControlName="password"
                            class="w-full md:w-100"
                            placeholder="Password"
                            [ngClass]="{'p-invalid': signInForm.get('password')?.invalid && signInForm.get('password')?.touched}"
                        />
                    </p-iconfield>
                    <small *ngIf="signInForm.get('password')?.invalid && signInForm.get('password')?.touched"
                           class="p-error block mb-4">
                        Password is required
                    </small>


                    <button
                        type="submit"
                        pButton
                        pRipple
                        class="w-full"
                        [disabled]="signInForm.invalid || loading">
                        <i *ngIf="loading" class="pi pi-spin pi-spinner mr-2"></i>
                        <span>Log In</span>
                    </button>
                </form>
            </div>
        </div>


        <app-configurator [simple]="true"/>
    `,
    providers: [MessageService], // <-- ADD THIS

})
export class Login implements OnInit {
    loading = false;
    messages: any[] = [];
    signInForm!: FormGroup;
    LayoutService = inject(LayoutService);
    private messageService = inject(MessageService);

    isDarkTheme = computed(() => this.LayoutService.isDarkTheme());

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router
    ) {
    }

    ngOnInit() {
        this.signInForm = this._formBuilder.group({
            username     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: ['']
        });
    }

    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            this.signInForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        this.signInForm.disable();

        this._authService.signIn({
            username: this.signInForm.value.username,
            password: this.signInForm.value.password
        }).subscribe({
            next: () => {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/';
                this._router.navigateByUrl(redirectURL);
            },
            error: (error) => {
                this.loading = false;
                this.signInForm.enable();

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.exceptionMessage?.message || 'Login failed. Please check your credentials.'
                });
            }
        });
    }
}
