import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppMenu } from './app.menu';
import { LayoutService } from '@/layout/service/layout.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: '[app-sidebar]',
    standalone: true,
    imports: [AppMenu, RouterModule],
    template: ` <div
        class="layout-sidebar"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
    >
        <div class="sidebar-header">
            <a [routerLink]="['/']" class="app-logo">
                <svg viewBox="0 0 160 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="app-logo-normal">
                    <path d="M10 0L0 20.9465H3.53702L10 6.07843L16.463 20.9465H20L10 0Z" fill="var(--logo-color)" />
                    <path d="M13.84 15.7927L16.2077 21.0016H11.7682L13.84 15.7927Z" fill="var(--logo-color)" />

                    <path d="M28.4851 0L18 20.9465H21.537L28.4856 6.07843L35.2944 20.9465H38.9715L28.4851 0Z" fill="var(--logo-color)" />
                    <path d="M27.0465 21.0016L24.6788 15.7927L22.607 21.0016H27.0465Z" fill="var(--logo-color)" />

                    <path d="M55 4H50V18H52V11H55V18H57V4H55Z" fill="var(--logo-color)" /> <path d="M60 4H66V6H62V10H65V12H62V16H66V18H60V4Z" fill="var(--logo-color)" /> <path d="M72 18C69 18 68 16 68 14H70C70 15 70.5 16 72 16C73.5 16 74 15 74 14C74 13 73.5 12 71 11C69 10 68 9 68 7C68 5 69.5 4 72 4C74.5 4 76 5.5 76 7.5H74C74 6 73.5 5.5 72 5.5C70.5 5.5 70 6 70 7C70 8 70.5 8.5 73 9.5C75 10.5 76 11.5 76 14C76 16.5 74.5 18 72 18Z" fill="var(--logo-color)" /> <path d="M84 4V14C84 16.5 82.5 18 80 18C77.5 18 76 16.5 76 14V4H78V14C78 15.5 78.5 16 80 16C81.5 16 82 15.5 82 14V4H84Z" fill="var(--logo-color)" /> <path d="M90 6V18H88V6H84V4H94V6H90Z" fill="var(--logo-color)" /> <path d="M104 14.5H98L96.5 18H94L101 2.8L108 18H105.5L104 14.5ZM103 12.5L101 7.5L99 12.5H103Z" fill="var(--logo-color)" /> <path d="M114 6V18H112V6H108V4H118V6H114Z" fill="var(--logo-color)" /> <path d="M128 14.5H122L120.5 18H118L125 2.8L132 18H129.5L128 14.5ZM127 12.5L125 7.5L123 12.5H127Z" fill="var(--logo-color)" /> <path d="M138 18C135 18 134 16 134 14H136C136 15 136.5 16 138 16C139.5 16 140 15 140 14C140 13 139.5 12 137 11C135 10 134 9 134 7C134 5 135.5 4 138 4C140.5 4 142 5.5 142 7.5H140C140 6 139.5 5.5 138 5.5C136.5 5.5 136 6 136 7C136 8 136.5 8.5 139 9.5C141 10.5 142 11.5 142 14C142 16.5 140.5 18 138 18Z" fill="var(--logo-color)" /> <path d="M148 18C145 18 144 16 144 11C144 6 145 4 148 4C151 4 152 6 152 11C152 16 151 18 148 18ZM148 16C149.5 16 150 14.5 150 11C150 7.5 149.5 6 148 6C146.5 6 146 7.5 146 11C146 14.5 146.5 16 148 16Z" fill="var(--logo-color)" /> <path d="M158 11V18H156V11L153 4H155.5L157 8L158.5 4H161L158 11Z" fill="var(--logo-color)" /> </svg>
            </a>
            <button
                class="layout-sidebar-anchor p-link z-2 hover:cursor-pointer"
                type="button"
                (click)="anchor()"
            ></button>
        </div>

        <div #menuContainer class="layout-menu-container">
            <app-menu></app-menu>
        </div>
    </div>`,
})
export class AppSidebar {
    timeout: any = null;

    @ViewChild('menuContainer') menuContainer!: ElementRef;
    constructor(
        public layoutService: LayoutService,
        public el: ElementRef,
    ) {}

    onMouseEnter() {
        if (!this.layoutService.layoutState().anchored) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.layoutService.layoutState.update((state) => {
                if (!state.sidebarActive) {
                    return {
                        ...state,
                        sidebarActive: true,
                    };
                }
                return state;
            });
        }
    }

    onMouseLeave() {
        if (!this.layoutService.layoutState().anchored) {
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    this.layoutService.layoutState.update((state) => {
                        if (state.sidebarActive) {
                            return {
                                ...state,
                                sidebarActive: false,
                            };
                        }
                        return state;
                    });
                }, 300);
            }
        }
    }

    anchor() {
        this.layoutService.layoutState.update((state) => ({
            ...state,
            anchored: !state.anchored,
        }));
    }
}
