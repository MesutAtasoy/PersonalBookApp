import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4">
        <h2 class="text-2xl font-semibold mb-3">Settings ⚙️</h2>
        <p class="text-color-secondary mb-4">
            Manage account preferences, including display name, notification settings, and security options.
        </p>

        <h3 class="text-xl font-semibold mt-5 mb-3">General Settings</h3>
        <p>Form fields for editing account details will go here.</p>

        <h3 class="text-xl font-semibold mt-5 mb-3 text-red-500">Danger Zone</h3>
        <p>Option to close or archive the account.</p>
    </div>
  `
})
export class AccountSettingsComponent implements OnInit {
    constructor() { }
    ngOnInit(): void { }
}
