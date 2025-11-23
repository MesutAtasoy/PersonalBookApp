import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-overview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4">
        <h2 class="text-2xl font-semibold mb-3">Overview 📈</h2>
        <p class="text-color-secondary mb-4">
            A snapshot of your account health, including current balance, available credit (if applicable), and recent activity.
        </p>

        <div class="grid p-fluid">
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Current Balance</span>
                    <span class="text-3xl text-primary font-bold">$15,340.55 USD</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Account Type</span>
                    <span class="text-3xl font-bold">Current Account</span>
                </div>
            </div>
            <div class="col-12 md:col-4">
                <div class="p-3 surface-200 border-round">
                    <span class="text-xl font-medium block">Opening Date</span>
                    <span class="text-3xl font-bold">Jan 1, 2020</span>
                </div>
            </div>
        </div>

        <h3 class="text-xl font-semibold mt-5 mb-3">Recent Transactions</h3>
        <p>Transaction list will appear here.</p>
    </div>
  `
})
export class AccountOverviewComponent implements OnInit {
    constructor() { }
    ngOnInit(): void { }
}
