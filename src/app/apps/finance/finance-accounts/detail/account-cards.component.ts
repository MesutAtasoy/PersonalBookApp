import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-cards',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4">
        <h2 class="text-2xl font-semibold mb-3">Cards 💳</h2>
        <p class="text-color-secondary mb-4">
            View and manage all debit and credit cards linked to this account.
        </p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Debit Cards</h3>
        <p>List of debit cards, with options to freeze, unfreeze, or report lost.</p>

        <h3 class="text-xl font-semibold mt-5 mb-3">Credit Cards (if applicable)</h3>
        <p>List of associated credit cards and quick management links.</p>
    </div>
  `
})
export class AccountCardsComponent implements OnInit {
    constructor() { }
    ngOnInit(): void { }
}
