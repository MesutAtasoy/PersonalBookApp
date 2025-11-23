import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-transactions',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4">
        <h2 class="text-2xl font-semibold mb-3">Transactions 🧾</h2>
        <p class="text-color-secondary mb-4">
            View, search, and categorize historical transactions for this account.
        </p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Transaction Filter</h3>
        <p>Search and filtering controls (date range, amount, description).</p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Transaction History</h3>
        <p>Data table listing all transactions.</p>
    </div>
  `
})
export class AccountTransactionsComponent implements OnInit {
    constructor() { }
    ngOnInit(): void { }
}
