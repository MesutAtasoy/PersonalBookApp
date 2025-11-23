import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-buckets',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4">
        <h2 class="text-2xl font-semibold mb-3">Buckets (Savings Goals) 🪣</h2>
        <p class="text-color-secondary mb-4">
            Manage your savings goals or virtual sub-accounts linked to the main balance.
        </p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Active Goals</h3>
        <p>List of travel, emergency, or long-term savings buckets.</p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Create New Bucket</h3>
        <p>Form to set up a new savings goal with automated transfers.</p>
    </div>
  `
})
export class AccountBucketsComponent implements OnInit {
    constructor() { }
    ngOnInit(): void { }
}
