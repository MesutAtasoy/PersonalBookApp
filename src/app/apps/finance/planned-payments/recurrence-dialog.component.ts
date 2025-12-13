import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import moment from "moment";
import {InputNumber} from "primeng/inputnumber";
import {Select} from "primeng/select";
import {SelectButton} from "primeng/selectbutton";
import {DatePicker} from "primeng/datepicker";
import {Button} from "primeng/button";
import {NgIf} from "@angular/common";


@Component({
    selector: 'calendar-recurrence',
    template: `
        <form
            class="row w-full p-6"
            [formGroup]="recurrenceForm">

            <div class="row">
                <div class="col-12">
                    <label for="interval-input" class="p-sr-only">Repeat every</label>
                    <span class="p-float-label">
                        <p-inputNumber
                            inputId="interval-input"
                            mode="decimal"
                            [showButtons]="true"
                            [min]="1"
                            formControlName="interval"
                            autocomplete="off">
                        </p-inputNumber>
                    </span>
                </div>

                <div class="col-12 mt-4">
                    <label for="freq-select" class="p-sr-only block">Frequency</label>
                    <p-select
                        inputId="freq-select"
                        [options]="frequencyOptions"
                        optionLabel="label"
                        optionValue="value"
                        formControlName="freq">
                    </p-select>
                </div>
            </div>

            <div
                class="flex flex-col mt-6"
                formGroupName="weekly"
                *ngIf="recurrenceForm.get('freq')?.value === 'WEEKLY'">
                <div class="font-medium mb-2">Repeat on</div>
                <p-selectButton
                    [options]="weekdaySelectOptions"
                    optionLabel="abbr"
                    optionValue="value"
                    formControlName="byDay"
                    [multiple]="true">
                </p-selectButton>
            </div>

            <div
                class="row mt-6"
                formGroupName="monthly"
                *ngIf="recurrenceForm.get('freq')?.value === 'MONTHLY'">
                <div class="p-field w-full">
                    <label for="repeatOn-select" class="p-sr-only mr-4">Repeat on</label>
                    <p-select
                        inputId="repeatOn-select"
                        [options]="monthlyRepeatOptions"
                        optionLabel="label"
                        optionValue="value"
                        formControlName="repeatOn"
                        appendTo="body">
                    </p-select>
                </div>
            </div>

            <div
                class="row  mt-4"
                formGroupName="end">
                <div class="col-12 mt-4">
                    <div class="p-field">
                        <label for="end-type-select" class="p-sr-only mr-4">Ends</label>
                        <span class="p-float-label">
                            <p-select
                                inputId="end-type-select"
                                [options]="endTypeOptions"
                                optionLabel="label"
                                optionValue="value"
                                formControlName="type"
                                appendTo="body">
                            </p-select>
                        </span>
                    </div>
                </div>
                <div class="col-12 mt-4">
                    <div
                        class="p-field ml-4"
                        *ngIf="recurrenceForm.get('end.type')?.value === 'until'">
                        <p-date-picker
                            formControlName="until"
                            [showIcon]="true"
                            [appendTo]="'body'"
                            dateFormat="yy/mm/dd">
                        </p-date-picker>
                    </div>

                    <div
                        class="p-field w-40 ml-4 flex items-center"
                        *ngIf="recurrenceForm.get('end.type')?.value === 'count'">
                        <label for="count-input" class="p-sr-only">Count</label>
                        <p-inputNumber
                            inputId="count-input"
                            mode="decimal"
                            [showButtons]="true"
                            [min]="1"
                            formControlName="count"
                            autocomplete="off"
                            class="flex-grow">
                        </p-inputNumber>
                        <span class="ml-2">occurrence(s)</span>
                    </div>
                </div>
            </div>

            <div class="ml-auto mt-8 space-x-2">
                <p-button
                    label="Clear"
                    styleClass="p-button-text"
                    (onClick)="clear()">
                </p-button>
                <p-button
                    label="Done"
                    [disabled]="recurrenceForm.invalid"
                    (onClick)="done()">
                </p-button>
            </div>
        </form>
    `,
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputNumber,
        Select,
        SelectButton,
        DatePicker,
        Button,
        NgIf
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [DialogService]
})
export class CalendarRecurrenceComponent implements OnInit, OnDestroy
{
    nthWeekdayText!: string;
    recurrenceForm!: FormGroup;
    recurrenceFormValues: any;
    weekdays!: CalendarWeekday[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // PrimeNG Dropdown/Select Options
    frequencyOptions: { label: string, value: string }[];
    endTypeOptions: { label: string, value: string }[];
    weekdaySelectOptions: { abbr: string, value: string, label: string }[];
    monthlyRepeatOptions: { label: string, value: string }[];


    /**
     * Constructor
     */
    constructor(
        @Inject(DynamicDialogConfig) public config: DynamicDialogConfig,
        public dialogRef: DynamicDialogRef,
        private _formBuilder: FormBuilder
    )
    {
        // Initialize PrimeNG dropdown options
        this.frequencyOptions = [
            { label: 'day(s)', value: 'DAILY' },
            { label: 'week(s)', value: 'WEEKLY' },
            { label: 'month(s)', value: 'MONTHLY' },
            { label: 'year(s)', value: 'YEARLY' }
        ];

        this.endTypeOptions = [
            { label: 'Never', value: 'never' },
            { label: 'On', value: 'until' },
            { label: 'After', value: 'count' }
        ];

        this.weekdaySelectOptions = [];
        this.monthlyRepeatOptions = [];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get weekdays
        this.weekdays = weekdays;
        // Prepare PrimeNG SelectButton options
        this.weekdaySelectOptions = weekdays.map(day => ({
            abbr: day.abbr,
            value: day.value,
            label: day.label
        }));

        // Initialize with event data (config.data is the replacement for data)
        this._init();

        // Prepare monthly repeat options after _init calculates dynamic texts
        this.monthlyRepeatOptions = [
            { label: `Monthly on day ${this.recurrenceFormValues.monthly.date}`, value: 'date' },
            { label: `Monthly on the ${this.nthWeekdayText}`, value: 'nthWeekday' }
        ];

        // Create the recurrence form
        this.recurrenceForm = this._formBuilder.group({
            freq    : [null],
            interval: [null, Validators.required],
            weekly  : this._formBuilder.group({
                byDay: [[]]
            }),
            monthly : this._formBuilder.group({
                repeatOn  : [null], // date | nthWeekday
                date      : [null],
                nthWeekday: [null]
            }),
            end     : this._formBuilder.group({
                type : [null], // never | until | count
                until: [null],
                count: [null]
            })
        });

        // Subscribe to 'freq' field value changes
        this.recurrenceForm.get('freq')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
            this._setEndValues(value);
        });

        // Subscribe to 'weekly.byDay' field value changes
        this.recurrenceForm.get('weekly.byDay')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {

            // Get the event's start date
            const startDate = moment(this.config.data.event.start);

            if ( !value || !value.length )
            {
                // Get the day of event start date
                const eventStartDay = startDate.format('dd').toUpperCase();

                // Set the original value back without emitting a change event
                this.recurrenceForm.get('weekly.byDay')?.setValue([eventStartDay], {emitEvent: false});
            }
        });

        // PrimeNG Calendar uses Date objects, so convert the ISO string in recurrenceFormValues
        if (this.recurrenceFormValues.end.until) {
            this.recurrenceFormValues.end.until = moment.utc(this.recurrenceFormValues.end.until).toDate();
        }

        // Patch the form with the values
        this.recurrenceForm.patchValue(this.recurrenceFormValues);

        // Set end values for the first time
        this._setEndValues(this.recurrenceForm.get('freq')?.value);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        this._unsubscribeAll.complete();
        this.dialogRef.close();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Clear
     */
    clear(): void
    {
        // Close the dialog using PrimeNG DynamicDialogRef
        this.dialogRef.close({recurrence: 'cleared'});
    }

    /**
     * Done
     */
    done(): void
    {
        // Get the recurrence form values
        const recurrenceForm = this.recurrenceForm.value;

        // Prepare the rule array and add the base rules
        const ruleArr = ['FREQ=' + recurrenceForm.freq, 'INTERVAL=' + recurrenceForm.interval];

        // If monthly on certain days...
        if ( recurrenceForm.freq === 'MONTHLY' && recurrenceForm.monthly.repeatOn === 'nthWeekday' )
        {
            ruleArr.push('BYDAY=' + recurrenceForm.monthly.nthWeekday);
        }

        // If weekly...
        if ( recurrenceForm.freq === 'WEEKLY' )
        {
            // PrimeNG selectButton returns an array
            if ( Array.isArray(recurrenceForm.weekly.byDay) )
            {
                ruleArr.push('BYDAY=' + recurrenceForm.weekly.byDay.join(','));
            }
            else
            {
                ruleArr.push('BYDAY=' + recurrenceForm.weekly.byDay);
            }
        }

        // If one of the end options is selected...
        if ( recurrenceForm.end.type === 'until' )
        {
            // Convert Date object from PrimeNG Calendar to the required UTC ISO string format.
            const untilDate = moment(recurrenceForm.end.until).endOf('day').utc().format('YYYYMMDD[T]HHmmss[Z]');
            ruleArr.push('UNTIL=' + untilDate);
        }

        if ( recurrenceForm.end.type === 'count' )
        {
            ruleArr.push('COUNT=' + recurrenceForm.end.count);
        }

        // Generate rule text
        const ruleText = ruleArr.join(';');

        // Close the dialog
        this.dialogRef.close({recurrence: ruleText});
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize
     *
     * @private
     */
    private _init(): void
    {
        if (this.config.data.weekdays) {
            this.weekdays = this.config.data.weekdays
        }

        // Get the event's start date
        const startDate = moment(this.config.data.event.start);

        // Calculate the weekday (e.g., MO, TU)
        const weekday = startDate.format('dd').toUpperCase();

        // Calculate the nthWeekday (e.g., 1MO, 2TU, etc.)
        const nthWeekday = (Math.ceil(startDate.date() / 7)) + weekday;


        // Calculate the nthWeekday as display text (e.g., "1st Monday")
        const ordinalNumberSuffixes : any = {
            1: 'st',
            2: 'nd',
            3: 'rd',
            4: 'th',
            5: 'th'
        };
        const n = nthWeekday.slice(0, 1);
        const dayAbbr = nthWeekday.slice(-2);
        const dayLabel = this.weekdays.find(item => item.value === dayAbbr)?.label || dayAbbr;

        this.nthWeekdayText = n + (ordinalNumberSuffixes[n] || 'th') + ' ' + dayLabel;

        // Set the defaults on recurrence form values
        this.recurrenceFormValues = {
            freq    : 'DAILY',
            interval: 1,
            weekly  : {
                byDay: [weekday]
            },
            monthly : {
                repeatOn  : 'date',
                date      : startDate.date(),
                nthWeekday: nthWeekday
            },
            end     : {
                type : 'never',
                until: null,
                count: null
            }
        };

        // If recurrence rule string is available on the event...
        if ( this.config.data.event.recurrence )
        {
            // Parse the rules
            const parsedRules: any = {};
            this.config.data.event.recurrence.split(';').forEach((rule: string) => {
                parsedRules[rule.split('=')[0]] = rule.split('=')[1];
            });

            // Overwrite the recurrence form values
            this.recurrenceFormValues.freq = parsedRules.FREQ;
            this.recurrenceFormValues.interval = parseInt(parsedRules.INTERVAL, 10);

            if ( parsedRules.FREQ === 'WEEKLY' && parsedRules.BYDAY)
            {
                this.recurrenceFormValues.weekly.byDay = parsedRules.BYDAY.split(',');
            }

            if ( parsedRules.FREQ === 'MONTHLY' )
            {
                this.recurrenceFormValues.monthly.repeatOn = parsedRules.BYDAY ? 'nthWeekday' : 'date';
            }

            this.recurrenceFormValues.end.type = parsedRules.UNTIL ? 'until' : (parsedRules.COUNT ? 'count' : 'never');
            // Store the raw ISO string for later conversion to Date object
            this.recurrenceFormValues.end.until = parsedRules.UNTIL ? moment.utc(parsedRules.UNTIL).toISOString() : null;
            this.recurrenceFormValues.end.count = parsedRules.COUNT ? parseInt(parsedRules.COUNT, 10) : null;
        }
    }

    /**
     * Set the end value based on frequency
     *
     * @param freq
     * @private
     */
    private _setEndValues(freq: string): void
    {
        if ( !freq )
        {
            return;
        }

        const startDate = moment(this.config.data.event.start);
        const endType = this.recurrenceForm.get('end.type')?.value;

        // Set default 'until' date
        if ( endType !== 'until' )
        {
            let untilMoment;

            if ( freq === 'DAILY' ) { untilMoment = startDate.clone().add(1, 'month'); }
            if ( freq === 'WEEKLY' ) { untilMoment = startDate.clone().add(12, 'weeks'); }
            if ( freq === 'MONTHLY' ) { untilMoment = startDate.clone().add(12, 'months'); }
            if ( freq === 'YEARLY' ) { untilMoment = startDate.clone().add(5, 'years'); }

            if (untilMoment) {
                this.recurrenceForm.get('end.until')?.setValue(untilMoment.toDate());
            }
        }

        // Set default 'count'
        if ( endType !== 'count' )
        {
            let count;

            if ( freq === 'DAILY' ) { count = 30; }
            if ( freq === 'WEEKLY' || freq === 'MONTHLY' ) { count = 12; }
            if ( freq === 'YEARLY' ) { count = 5; }

            this.recurrenceForm.get('end.count')?.setValue(count);
        }
    }
}

export const weekdays = [
    {
        abbr : 'M',
        label: 'Monday',
        value: 'MO'
    },
    {
        abbr : 'T',
        label: 'Tuesday',
        value: 'TU'
    },
    {
        abbr : 'W',
        label: 'Wednesday',
        value: 'WE'
    },
    {
        abbr : 'T',
        label: 'Thursday',
        value: 'TH'
    },
    {
        abbr : 'F',
        label: 'Friday',
        value: 'FR'
    },
    {
        abbr : 'S',
        label: 'Saturday',
        value: 'SA'
    },
    {
        abbr : 'S',
        label: 'Sunday',
        value: 'SU'
    }
];

export interface CalendarWeekday {
    abbr: string;
    label: string;
    value: string;
}
