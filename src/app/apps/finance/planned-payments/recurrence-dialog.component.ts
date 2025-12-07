import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

import { RRule, Frequency } from 'rrule'
import {DatePickerModule} from "primeng/datepicker";
import moment from "moment";

interface RRuleForm {
    freq: Frequency;
    interval: number;
    weekly: {
        byDay: string[]; // e.g., ['MO', 'WE']
    };
    monthly: {
        repeatOn: 'date' | 'nthWeekday';
        date: number | null;
        nthWeekday: string | null; // e.g., '2TU'
    };
    end: {
        type: 'never' | 'until' | 'count';
        until: Date | null;
        count: number | null;
    };
}

// Weekday config to match your original
interface CalendarWeekday {
    label: string;
    abbr: string;
    value: string; // e.g., 'MO'
}

@Component({
    selector: 'app-recurrence-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        InputNumberModule,
        SelectModule,
        DialogModule,
        DatePickerModule,
    ],
    template: `
    <p-dialog
      header="Recurrence rules"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '50rem' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }"
      (onHide)="onClose.emit()" >

      <!-- Interval and frequency -->
      <div class="flex mt-4 items-end">
        <div class="mr-4">
          <label class="text-sm font-medium block mb-1">Repeat every</label>
          <p-inputNumber
            [ngModel]="recurrenceForm.interval"
            (ngModelChange)="updateForm('interval', $event)"
            [min]="1"
            [showButtons]="true"
            inputStyleClass="w-20"
            styleClass="w-20">
          </p-inputNumber>
        </div>

        <div>
          <label class="text-sm font-medium block mb-1">&nbsp;</label>
          <p-select
            [ngModel]="recurrenceForm.freq"
            (ngModelChange)="onFreqChange($event)"
            [options]="freqOptions"
            optionLabel="label"
            optionValue="value"
            styleClass="w-36">
          </p-select>
        </div>
      </div>

      <!-- Weekly repeat options -->
      <div class="mt-6" *ngIf="recurrenceForm.freq === 1">
        <div class="font-medium mb-2">Repeat on</div>
        <div class="flex space-x-2">
          <ng-container *ngFor="let weekday of weekdays">
            <p-button
              [text]="true"
              [rounded]="true"
              [outlined]="!isDaySelected(weekday.value)"
              [raised]="isDaySelected(weekday.value)"
              [styleClass]="isDaySelected(weekday.value) ? 'bg-primary text-white shadow-none' : 'border border-surface-300'"
              (onClick)="toggleWeeklyDay(weekday.value)"
              tooltipPosition="top">
              {{ weekday.abbr }}
            </p-button>
          </ng-container>
        </div>
      </div>

      <!-- Monthly repeat options -->
      <div class="mt-6" *ngIf="recurrenceForm.freq === 2">
        <p-select
          [ngModel]="recurrenceForm.monthly.repeatOn"
          (ngModelChange)="updateMonthlyRepeatOn($event)"
          [options]="monthlyOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Repeat on"
          styleClass="w-full">
        </p-select>
        <small class="text-sm text-surface-500 mt-1 block">
          <ng-container *ngIf="recurrenceForm.monthly.repeatOn === 'date'">
            Monthly on day {{ recurrenceForm.monthly.date }}
          </ng-container>
          <ng-container *ngIf="recurrenceForm.monthly.repeatOn === 'nthWeekday'">
            {{ nthWeekdayText }}
          </ng-container>
        </small>
      </div>

      <!-- Ends -->
      <div class="mt-8">
        <div class="flex items-end">
          <div>
            <label class="text-sm font-medium block mb-1">Ends</label>
            <p-select
              [ngModel]="recurrenceForm.end.type"
              (ngModelChange)="updateEndType($event)"
              [options]="endOptions"
              optionLabel="label"
              optionValue="value"
              styleClass="w-32">
            </p-select>
          </div>

          <div class="ml-4" *ngIf="recurrenceForm.end.type === 'until'">
            <p-date-picker
              [ngModel]="recurrenceForm.end.until"
              (ngModelChange)="updateForm('end.until', $event)"
              [showIcon]="true"
              dateFormat="yy/mm/dd"
              inputStyleClass="w-36"
              styleClass="w-36">
            </p-date-picker>
          </div>

          <div class="ml-4" *ngIf="recurrenceForm.end.type === 'count'">
            <p-inputNumber
              [ngModel]="recurrenceForm.end.count"
              (ngModelChange)="updateForm('end.count', $event)"
              [min]="1"
              [showButtons]="true"
              inputStyleClass="w-32"
              styleClass="w-32">
              <ng-template pTemplate="suffix">
                <span class="ml-2 text-surface-600 text-sm">occurrence(s)</span>
              </ng-template>
            </p-inputNumber>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button
            label="Clear"
            severity="secondary"
            (onClick)="clear()">
          </p-button>
          <p-button
            label="Done"
            [disabled]="!isFormValid()"
            (onClick)="done()">
          </p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
    styles: [`
    ::ng-deep .p-button.p-button-outlined {
      background-color: transparent !important;
    }
    ::ng-deep .p-button.rounded {
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      font-weight: 600;
    }
  `]
})
export class RecurrenceDialogComponent implements OnInit, OnChanges {
    @Input() visible: boolean = false;
    @Input() currentRecurrenceRule: string | null = null;
    @Input() eventStartDate: Date | null = null;

    @Output() rruleApplied = new EventEmitter<string | null>();
    @Output() onClose = new EventEmitter<void>();

    recurrenceForm: RRuleForm = {
        freq: Frequency.DAILY,
        interval: 1,
        weekly: { byDay: [] },
        monthly: { repeatOn: 'date', date: 1, nthWeekday: null },
        end: { type: 'never', until: null, count: null }
    };

    nthWeekdayText: string = '';
    weekdays: CalendarWeekday[] = [
        { label: 'Monday', abbr: 'M', value: 'MO' },
        { label: 'Tuesday', abbr: 'T', value: 'TU' },
        { label: 'Wednesday', abbr: 'W', value: 'WE' },
        { label: 'Thursday', abbr: 'T', value: 'TH' },
        { label: 'Friday', abbr: 'F', value: 'FR' },
        { label: 'Saturday', abbr: 'S', value: 'SA' },
        { label: 'Sunday', abbr: 'S', value: 'SU' }
    ];

    freqOptions = [
        { label: 'day(s)', value: Frequency.DAILY },
        { label: 'week(s)', value: Frequency.WEEKLY },
        { label: 'month(s)', value: Frequency.MONTHLY },
        { label: 'year(s)', value: Frequency.YEARLY }
    ];

    monthlyOptions = [
        { label: 'Day of month', value: 'date' },
        { label: 'Nth weekday', value: 'nthWeekday' }
    ];

    endOptions = [
        { label: 'Never', value: 'never' },
        { label: 'On', value: 'until' },
        { label: 'After', value: 'count' }
    ];

    ngOnInit(): void {
        this.initializeForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible) {
            this.initializeForm();
        }
    }

    private initializeForm(): void {
        const start = this.eventStartDate ? moment(this.eventStartDate) : moment();
        const dayOfMonth = start.date();
        const weekdayAbbr = start.format('dd').toUpperCase().substring(0, 2); // e.g., TU

        // Compute nthWeekday (e.g., '2TU')
        let nth = Math.ceil(dayOfMonth / 7);
        if (nth > 4) nth = -1; // last week
        const nthWeekday = (nth === -1 ? 'L' : nth.toString()) + weekdayAbbr;

        // Map nth to readable text
        const ordinals: Record<string, string> = { '1': 'st', '2': 'nd', '3': 'rd', '4': 'th', 'L': 'last' };
        const weekdayLabel = this.weekdays.find(w => w.value === weekdayAbbr)?.label || 'Day';
        this.nthWeekdayText = (nth === -1 ? 'Last' : nth + ordinals[nth.toString()]) + ' ' + weekdayLabel;

        // Set defaults
        this.recurrenceForm = {
            freq: Frequency.DAILY,
            interval: 1,
            weekly: { byDay: [weekdayAbbr] },
            monthly: { repeatOn: 'date', date: dayOfMonth, nthWeekday: nthWeekday },
            end: { type: 'never', until: null, count: null }
        };

        // Parse existing rule
        if (this.currentRecurrenceRule) {
            this.parseRRule(this.currentRecurrenceRule);
        }

        this.setEndDefaults();
    }

    private parseRRule(rruleStr: string): void {
        try {
            const rule = RRule.fromString(rruleStr);
            this.recurrenceForm.freq = rule.options.freq;
            this.recurrenceForm.interval = rule.options.interval || 1;

            // Weekly
            if (rule.options.byweekday) {
                this.recurrenceForm.weekly.byDay = (Array.isArray(rule.options.byweekday)
                        ? rule.options.byweekday
                        : [rule.options.byweekday]
                ).map(w => w.toString());
            }

            // Monthly
            if (rule.options.freq === Frequency.MONTHLY) {
                if (rule.options.bymonthday && rule.options.bymonthday.length > 0) {
                    this.recurrenceForm.monthly.repeatOn = 'date';
                    this.recurrenceForm.monthly.date = rule.options.bymonthday[0];
                } else if (rule.options.bysetpos && rule.options.byweekday) {
                    this.recurrenceForm.monthly.repeatOn = 'nthWeekday';
                    const pos = Array.isArray(rule.options.bysetpos) ? rule.options.bysetpos[0] : rule.options.bysetpos;
                    const day = Array.isArray(rule.options.byweekday) ? rule.options.byweekday[0] : rule.options.byweekday;
                    const posStr = pos === -1 ? 'L' : pos.toString();
                    this.recurrenceForm.monthly.nthWeekday = posStr + day.toString();
                    // Recompute text
                    const label = this.weekdays.find(w => w.value === day.toString())?.label || 'Day';
                    this.nthWeekdayText = (pos === -1 ? 'Last' : pos + (pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th')) + ' ' + label;
                }
            }

            // End
            if (rule.options.count) {
                this.recurrenceForm.end.type = 'count';
                this.recurrenceForm.end.count = rule.options.count;
            } else if (rule.options.until) {
                this.recurrenceForm.end.type = 'until';
                this.recurrenceForm.end.until = rule.options.until;
            } else {
                this.recurrenceForm.end.type = 'never';
            }
        } catch (e) {
            console.warn('Failed to parse RRULE', e);
        }
    }

    private setEndDefaults(): void {
        if (!this.eventStartDate) return;
        const start = moment(this.eventStartDate);
        const freq = this.recurrenceForm.freq;

        if (this.recurrenceForm.end.type !== 'until') {
            let until = start.clone().add(
                freq === Frequency.DAILY ? 1 : (freq === Frequency.YEARLY ? 5 : 12),
                freq === Frequency.DAILY ? 'months' :
                    freq === Frequency.WEEKLY ? 'weeks' :
                        freq === Frequency.MONTHLY ? 'months' : 'years'
            );
            this.recurrenceForm.end.until = until.toDate();
        }

        if (this.recurrenceForm.end.type !== 'count') {
            this.recurrenceForm.end.count = freq === Frequency.DAILY ? 30 :
                (freq === Frequency.YEARLY ? 5 : 12);
        }
    }

    onFreqChange(value: Frequency): void {
        this.recurrenceForm.freq = value;
        this.setEndDefaults();
    }

    updateMonthlyRepeatOn(value: 'date' | 'nthWeekday'): void {
        this.recurrenceForm.monthly.repeatOn = value;
    }

    updateEndType(value: 'never' | 'until' | 'count'): void {
        this.recurrenceForm.end.type = value;
        this.setEndDefaults();
    }

    updateForm(path: string, value: any): void {
        const keys = path.split('.');
        let obj = this.recurrenceForm as any;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    }

    isDaySelected(value: string): boolean {
        return this.recurrenceForm.weekly.byDay.includes(value);
    }

    toggleWeeklyDay(value: string): void {
        const days = this.recurrenceForm.weekly.byDay;
        const idx = days.indexOf(value);
        if (idx >= 0) {
            days.splice(idx, 1);
        } else {
            days.push(value);
        }
        // Ensure at least one day is selected
        if (days.length === 0 && this.eventStartDate) {
            const fallback = moment(this.eventStartDate).format('dd').toUpperCase().substring(0, 2);
            this.recurrenceForm.weekly.byDay = [fallback];
        }
    }

    isFormValid(): boolean {
        if (this.recurrenceForm.interval < 1) return false;
        if (this.recurrenceForm.freq === Frequency.WEEKLY && this.recurrenceForm.weekly.byDay.length === 0) return false;
        if (this.recurrenceForm.end.type === 'count' && (!this.recurrenceForm.end.count || this.recurrenceForm.end.count < 1)) return false;
        if (this.recurrenceForm.end.type === 'until' && !this.recurrenceForm.end.until) return false;
        return true;
    }

    clear(): void {
        this.rruleApplied.emit(null);
        this.onClose.emit();
    }

    done(): void {
        if (!this.isFormValid() || !this.eventStartDate) return;

        if (this.recurrenceForm.end.type === 'never') {
            this.rruleApplied.emit(null);
            this.onClose.emit();
            return;
        }

        const ruleArr = [
            `FREQ=${Frequency[this.recurrenceForm.freq]}`,
            `INTERVAL=${this.recurrenceForm.interval}`
        ];

        // Weekly
        if (this.recurrenceForm.freq === Frequency.WEEKLY && this.recurrenceForm.weekly.byDay.length) {
            ruleArr.push(`BYDAY=${this.recurrenceForm.weekly.byDay.join(',')}`);
        }

        // Monthly nth weekday
        if (this.recurrenceForm.freq === Frequency.MONTHLY && this.recurrenceForm.monthly.repeatOn === 'nthWeekday') {
            ruleArr.push(`BYDAY=${this.recurrenceForm.monthly.nthWeekday?.substring(1)}`);
            const pos = this.recurrenceForm.monthly.nthWeekday?.charAt(0);
            if (pos === 'L') {
                ruleArr.push('BYSETPOS=-1');
            } else {
                ruleArr.push(`BYSETPOS=${pos}`);
            }
        }

        // End conditions
        if (this.recurrenceForm.end.type === 'until' && this.recurrenceForm.end.until) {
            const until = moment(this.recurrenceForm.end.until)
                .endOf('day')
                .utc()
                .format('YYYYMMDDTHHmmss[Z]');
            ruleArr.push(`UNTIL=${until}`);
        }

        if (this.recurrenceForm.end.type === 'count' && this.recurrenceForm.end.count) {
            ruleArr.push(`COUNT=${this.recurrenceForm.end.count}`);
        }

        this.rruleApplied.emit(ruleArr.join(';'));
        this.onClose.emit();
    }
}
