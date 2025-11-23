import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-installment-plans',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4">
        <h2 class="text-2xl font-semibold mb-3">Installment Plans 📅</h2>
        <p class="text-color-secondary mb-4">
            Manage recurring bills, subscription payments, or loan installment schedules tied to this account.
        </p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Active Installments</h3>
        <p>List of current installment plans and their next due dates.</p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Loan Schedule (if applicable)</h3>
        <p>Full amortization schedule for any loan associated with this account.</p>
    </div>
  `
})
export class AccountInstallmentPlansComponent implements OnInit {
    constructor() { }
    ngOnInit(): void { }
}
