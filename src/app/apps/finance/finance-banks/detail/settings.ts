import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-bank-settings',
    standalone: true,
    imports: [CommonModule, SkeletonModule, ButtonModule],
    template: `
    <h3 class="text-xl font-semibold mb-3">Integration and Preferences</h3>
    <p>Manage API keys, synchronization settings, and other bank-specific configurations here.</p>

    <div class="p-field mt-4">
        <p-skeleton width="50%" height="2rem" styleClass="mb-2"></p-skeleton>
        <p-skeleton width="100%" height="3rem"></p-skeleton>
    </div>
    <div class="p-field mt-4">
        <p-skeleton width="40%" height="2rem" styleClass="mb-2"></p-skeleton>
        <p-skeleton width="100%" height="3rem"></p-skeleton>
    </div>
    <div class="mt-5 text-right">
        <p-button label="Save Settings" icon="pi pi-save"></p-button>
    </div>
  `
})
export class BankSettingsComponent { }
