import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {
    CurrencyCode,
    FinanceAccount,
    FinanceTransactionTypeDto,
    FinanceAccountType,
    FinanceAccountTypeDto,
    FinanceCategory,
    FinanceTransaction,
    FinanceTransactionType,
    CreateTransactionDto,
    DateTimeRangeType,
    DateTimeRangeTypeDto,
    Stat,
    FinanceBucket,
    Bank,
    FinanceTransactionSearchFilter,
    FinanceBank,
    FinanceAccountSearchFilter,
    CategoryStat,
    FinanceBucketStats,
    FinancePlannedPaymentItemStatsResponse,
    FinanceBucketSearchQuery,
    Card,
    FinancePlannedPayment,
    FinancePlannedPaymentItem,
    FinancePlannedPaymentItemSearchQuery,
    FinancePlannedPaymentItemSearchFilter,
    FinanceInstallmentPlanDto, FinanceInstallmentPlanSearchFilter, FinanceInstallmentDetailDto
} from './finance.types';
import {PersonalBookApiHttpClient} from "@/core/http/personal-book-api.http";
import {FilterConfig} from "@/core/components/career-filter/model";
import {CareerUtils} from "@/core/utils/career.utils";
import {SearchFilter} from "@/core/pagination/personal-book.pagination";
import {CareerFilterRequest, CareerQueryResponse} from "@/core/components/career-filter/pagination.model";
import {ApiResponse} from "@/core/response/api-response.model";


@Injectable({
    providedIn: 'root'
})
export class PersonalFinanceService {
    // Private
    private _drawerOpen: BehaviorSubject<boolean>;
    private _currencies: BehaviorSubject<CurrencyCode[] | null> = new BehaviorSubject<CurrencyCode[] | null>(null);
    private _financeAccount: BehaviorSubject<FinanceAccount | null> = new BehaviorSubject<FinanceAccount | null>(null);
    private _financeAccounts: BehaviorSubject<FinanceAccount[] | null> = new BehaviorSubject<FinanceAccount[] | null>(null);
    private _financeAccountsPagination: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _financeBudget: BehaviorSubject<FinanceBucket | null> = new BehaviorSubject<FinanceBucket | null>(null);
    private _financeBudgets: BehaviorSubject<FinanceBucket[] | null> = new BehaviorSubject<FinanceBucket[] | null>(null);
    private _financeCategory: BehaviorSubject<FinanceCategory | null> = new BehaviorSubject<FinanceCategory | null>(null);
    private _financeCategories: BehaviorSubject<FinanceCategory[] | null> = new BehaviorSubject<FinanceCategory[] | null>(null);
    private _financeParentCategories: BehaviorSubject<FinanceCategory[] | null> = new BehaviorSubject<FinanceCategory[] | null>(null);
    private _financeTransactions: BehaviorSubject<FinanceTransaction[] | null> = new BehaviorSubject<FinanceTransaction[] | null>(null);
    private _financeTransactionsPagination: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _financeAccountTypes: BehaviorSubject<FinanceAccountTypeDto[] | null> = new BehaviorSubject<FinanceAccountTypeDto[] | null>(FinanceAccountType.All);
    private _financeTransactionTypes: BehaviorSubject<FinanceTransactionTypeDto[] | null> = new BehaviorSubject<FinanceTransactionTypeDto[] | null>(FinanceTransactionType.All);
    private _financeCategoriesPagination: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _financeBudgetsPagination: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _dateTimeRangeTypes: BehaviorSubject<DateTimeRangeTypeDto[] | null> = new BehaviorSubject<DateTimeRangeTypeDto[] | null>(DateTimeRangeType.All);
    private _banks: BehaviorSubject<Bank[] | null> = new BehaviorSubject<Bank[] | null>(null);
    private _financeBanks: BehaviorSubject<FinanceBank[] | null> = new BehaviorSubject<FinanceBank[] | null>(null);
    private _financeBank: BehaviorSubject<FinanceBank | null> = new BehaviorSubject<FinanceBank | null>(null);
    private _financeBanksPagination: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _financeBankMenu: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _cards: BehaviorSubject<Card[] | null> = new BehaviorSubject<Card[] | null>(null);
    private _financePlannedPayments: BehaviorSubject<FinancePlannedPayment[] | null> = new BehaviorSubject<FinancePlannedPayment[] | null>(null);
    private _financePlannedPaymentPagination: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    private _financePlannedPayment: BehaviorSubject<FinancePlannedPayment | null> = new BehaviorSubject<FinancePlannedPayment | null>(null);
    private _financeAccountMenu: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _financePlannedPaymentMenu: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _financePlannedPaymentItems: BehaviorSubject<FinancePlannedPaymentItem[] | null> = new BehaviorSubject<FinancePlannedPaymentItem[] | null>(null);
    private _financePlannedPaymentItemPagination: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    private _financeInstallmentPlans: BehaviorSubject<FinanceInstallmentPlanDto[] | null> = new BehaviorSubject<FinanceInstallmentPlanDto[] | null>(null);
    private _financeInstallmentPlanPagination: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
    private _filterConfig: BehaviorSubject<FilterConfig | null> = new BehaviorSubject<FilterConfig | null>(null);


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _apiClient: PersonalBookApiHttpClient) {
        this._drawerOpen = new BehaviorSubject<boolean>(true);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    get currencies$(): Observable<CurrencyCode[] | null> {
        return this._currencies.asObservable();
    }

    get financeAccounts$(): Observable<FinanceAccount[] | null> {
        return this._financeAccounts.asObservable();
    }

    get financeAccountsPagination$(): Observable<any> {
        return this._financeAccountsPagination.asObservable();
    }

    get financeAccount$(): Observable<FinanceAccount | null> {
        return this._financeAccount.asObservable();
    }

    get financeBuckets$(): Observable<FinanceBucket[] | null> {
        return this._financeBudgets.asObservable();
    }

    get financeBudgetsPagination$(): Observable<any> {
        return this._financeBudgetsPagination.asObservable();
    }

    get financeBucket$(): Observable<FinanceBucket | null> {
        return this._financeBudget.asObservable();
    }

    get financeCategories$(): Observable<FinanceCategory[] | null> {
        return this._financeCategories.asObservable();
    }

    get financeCategory$(): Observable<FinanceCategory | null> {
        return this._financeCategory.asObservable();
    }

    get financeCategoriesPagination$(): Observable<any> {
        return this._financeCategoriesPagination.asObservable();
    }

    get financeParentCategories$(): Observable<FinanceCategory[] | null> {
        return this._financeParentCategories.asObservable();
    }

    get financeTransactions$(): Observable<FinanceTransaction[] | null> {
        return this._financeTransactions.asObservable();
    }

    get financeTransactionsPagination$(): Observable<any> {
        return this._financeTransactionsPagination.asObservable();
    }

    get financeAccountTypes$(): Observable<FinanceAccountTypeDto[] | null> {
        return this._financeAccountTypes.asObservable();
    }

    get financeTransactionTypes$(): Observable<FinanceTransactionTypeDto[] | null> {
        return this._financeTransactionTypes.asObservable();
    }

    get dateTimeRangeTypes$(): Observable<DateTimeRangeTypeDto[] | null> {
        return this._dateTimeRangeTypes.asObservable();
    }

    get drawerOpen$(): Observable<boolean> {
        return this._drawerOpen.asObservable();
    }

    get banks$(): Observable<Bank[] | null> {
        return this._banks.asObservable();
    }

    get financeBanks$(): Observable<FinanceBank[] | null> {
        return this._financeBanks.asObservable();
    }

    get financeBank$(): Observable<FinanceBank | null> {
        return this._financeBank.asObservable();
    }

    get financeBanksPagination$(): Observable<any> {
        return this._financeBanksPagination.asObservable();
    }

    setDrawerOpen(isOpen: boolean) {
        this._drawerOpen.next(isOpen);
    }

    get financeBankMenu$(): Observable<any> {
        return this._financeBankMenu.asObservable();
    }

    setFinanceBankMenu(id: string) {
        this._financeBankMenu.next(id);
    }

    get cards$(): Observable<Card[] | null> {
        return this._cards.asObservable();
    }

    get financePlannedPayments$(): Observable<FinancePlannedPayment[] | null> {
        return this._financePlannedPayments.asObservable();
    }

    get financePlannedPaymentPagination$(): Observable<any> {
        return this._financePlannedPaymentPagination.asObservable();
    }

    get financePlannedPayment$(): Observable<FinancePlannedPayment | null> {
        return this._financePlannedPayment.asObservable();
    }

    get financeAccountMenu$(): Observable<any> {
        return this._financeAccountMenu.asObservable();
    }

    setFinanceAccountMenu(id: string) {
        this._financeAccountMenu.next(id);
    }

    get financePlannedPaymentMenu$(): Observable<any> {
        return this._financePlannedPaymentMenu.asObservable();
    }

    setFinancePlannedPaymentMenu(id: string) {
        this._financePlannedPaymentMenu.next(id);
    }

    get financePlannedPaymentItems$(): Observable<FinancePlannedPaymentItem[] | null> {
        return this._financePlannedPaymentItems.asObservable();
    }

    get financePlannedPaymentItemPagination$(): Observable<any> {
        return this._financePlannedPaymentItemPagination.asObservable();
    }

    get financeInstallmentPlans$(): Observable<FinanceInstallmentPlanDto[] | null> {
        return this._financeInstallmentPlans.asObservable();
    }

    get financeInstallmentPlanPagination$(): Observable<any> {
        return this._financeInstallmentPlanPagination.asObservable();
    }

    get filterConfig$(): Observable<FilterConfig | null> {
        return this._filterConfig.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getTransactions(pageNumber: number = 1,
                    pageSize: number = 20,
                    type: number = 1,
                    startDate: string = '',
                    endDate: string = '',
    ): Observable<FinanceTransaction[]> {

        const queryParams = { pageNumber, pageSize, type, startDate, endDate };

        return this._apiClient.get<FinanceTransaction[]>('api/apps/finance/transactions', { params: queryParams }).pipe(
            tap((response: any) => {
                const payload = response.payload;

                this._financeTransactions.next(payload.data ?? []);

                this._financeTransactionsPagination.next({
                    pageNumber: pageNumber - 1,
                    pageSize: pageSize,
                    totalPages: payload.totalPages,
                    totalRecords: payload.totalRecords,
                    nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                    previousPage: payload.previousPage
                });
            })
        );
    }

    searchTransactions(searchFilter: FinanceTransactionSearchFilter): Observable<FinanceTransaction[]> {

        return this._apiClient.post<FinanceTransaction[]>('api/apps/finance/transactions/search', searchFilter).pipe(
            tap((response: any) => {
                const payload = response.payload;

                this._financeTransactions.next(payload.data ?? []);

                this._financeTransactionsPagination.next({
                    pageNumber: (searchFilter.paginationFilter?.pageNumber ?? 0) - 1,
                    pageSize: searchFilter.paginationFilter?.pageSize ?? 0,
                    totalPages: payload.totalPages,
                    totalRecords: payload.totalRecords,
                    nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                    previousPage: payload.previousPage
                });
            })
        );
    }

    getTransactionsByAccountId(accountId: string,
                               bucketId: string = '',
                               pageNumber: number = 1,
                               pageSize: number = 20,
                               type: number = 1,
                               startDate: string = '',
                               endDate: string = '',): Observable<FinanceTransaction[]> {

        const queryParams = { pageNumber, pageSize, type, startDate, endDate, bucketId };

        return this._apiClient.get<FinanceTransaction[]>('api/apps/finance/accounts/' + accountId + '/transactions', { params: queryParams }).pipe(
            tap((response: any) => {
                const payload = response.payload;

                this._financeTransactions.next(payload.data ?? []);

                this._financeTransactionsPagination.next({
                    pageNumber: pageNumber - 1,
                    pageSize: pageSize,
                    totalPages: payload.totalPages,
                    totalRecords: payload.totalRecords,
                    nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                    previousPage: payload.previousPage
                });
            })
        );
    }

    getTransactionsByTagId(tagId: string,
                           pageNumber: number = 1,
                           pageSize: number = 20,
                           type: number = 1,
                           startDate: string = '',
                           endDate: string = '',
    ): Observable<FinanceTransaction[]> {

        const queryParams = { pageNumber, pageSize, type, startDate, endDate };

        return this._apiClient.get<FinanceTransaction[]>('api/apps/finance/tags/' + tagId + '/transactions', { params: queryParams }).pipe(
            tap((response: any) => {
                const payload = response.payload;

                this._financeTransactions.next(payload.data ?? []);

                this._financeTransactionsPagination.next({
                    pageNumber: pageNumber - 1,
                    pageSize: pageSize,
                    totalPages: payload.totalPages,
                    totalRecords: payload.totalRecords,
                    nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                    previousPage: payload.previousPage
                });
            })
        );
    }

    getTransactionsByCategoryId(categoryId: string,
                                pageNumber: number = 1,
                                pageSize: number = 20,
                                type: number = 1,
                                startDate: string = '',
                                endDate: string = '',): Observable<FinanceTransaction[]> {

        const queryParams = { pageNumber, pageSize, type, startDate, endDate };


        return this._apiClient.get<FinanceTransaction[]>('api/apps/finance/categories/' + categoryId + '/transactions', { params: queryParams }).pipe(
            tap((response: any) => {
                const payload = response.payload;

                this._financeTransactions.next(payload.data ?? []);

                this._financeTransactionsPagination.next({
                    pageNumber: pageNumber - 1,
                    pageSize: pageSize,
                    totalPages: payload.totalPages,
                    totalRecords: payload.totalRecords,
                    nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                    previousPage: payload.previousPage
                });
            })
        );
    }

    getCategoryStatsByAccountId(accountId: string,
                                bucketId = '',
                                transactionType: number,
                                type: number = 1,
                                startDate: string = '',
                                endDate: string = ''): Observable<Stat> {

        const queryParams = { transactionType, type, startDate, endDate, bucketId };

        return this._apiClient.get<Stat>('api/apps/finance/accounts/' + accountId + '/transactions/stats/categories', { params: queryParams });
    }

    createTransaction(transaction: CreateTransactionDto): Observable<FinanceTransaction> {
        return this.financeTransactions$.pipe(
            take(1),
            switchMap(financeTransactions => this._apiClient.post<FinanceTransaction>('api/apps/finance/transactions', transaction).pipe(
                map((response: any) => response.payload)
            ))
        );
    }

    deleteTransaction(id: string): Observable<any> {
        return this.financeTransactions$.pipe(
            take(1),
            switchMap(financeTransactions => this._apiClient.delete<FinanceTransaction>('api/apps/finance/transactions/' + id).pipe(
                map((isDeleted) => {
                    if (financeTransactions && Array.isArray(financeTransactions)) {
                        const index = financeTransactions.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeTransactions.splice(index, 1);
                            this._financeTransactions.next(financeTransactions);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }


    getCurrencyCodes(): Observable<ApiResponse> {
        return this._apiClient.get<ApiResponse>('api/apps/finance/currencies');
    }

    addCurrencyCode(currencyCode: CurrencyCode): Observable<CurrencyCode> {
        // Let server create ID and return payload
        return this.currencies$.pipe(
            take(1),
            switchMap(currencies => this._apiClient.post<CurrencyCode>('api/apps/finance/currencies', currencyCode).pipe(
                map((response: any) => {
                    const list = (currencies && Array.isArray(currencies)) ? currencies.slice() : [];
                    list.push(response.payload);
                    this._currencies.next(list);
                    return response.payload;
                })
            ))
        );
    }

    updateCurrencyCode(id: string, currencyCode: CurrencyCode): Observable<CurrencyCode> {
        return this.currencies$.pipe(
            take(1),
            switchMap(currencies => this._apiClient.put<CurrencyCode>('api/apps/finance/currencies/' + id, currencyCode).pipe(
                map((updated: any) => {
                    if (currencies && Array.isArray(currencies)) {
                        const index = currencies.findIndex(item => item.id === id);
                        if (index > -1) {
                            currencies[index] = updated.payload;
                            this._currencies.next(currencies);
                        }
                    }
                    return updated.payload;
                })
            ))
        );
    }

    deleteCurrencyCode(id: string): Observable<any> {
        return this.currencies$.pipe(
            take(1),
            switchMap(currencies => this._apiClient.delete<CurrencyCode>('api/apps/finance/currencies/' + id).pipe(
                map((isDeleted) => {
                    if (currencies && Array.isArray(currencies)) {
                        const index = currencies.findIndex(item => item.id === id);
                        if (index > -1) {
                            currencies.splice(index, 1);
                            this._currencies.next(currencies);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }


    getFinanceAccount(id: string): Observable<FinanceAccount> {
        return this._apiClient.get<FinanceAccount>('api/apps/finance/accounts/' + id);
    }

    getFinanceAccounts(): Observable<FinanceAccount[]> {
        return this._apiClient.get<FinanceAccount[]>('api/apps/finance/accounts').pipe(
            tap((response: any) => {
                this._financeAccounts.next(response.payload ?? []);
            }),
            map((response: any) => response.payload)
        );
    }

    addFinanceAccount(financeAccount: FinanceAccount): Observable<FinanceAccount> {

        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.post<FinanceAccount>('api/apps/finance/accounts', financeAccount).pipe(
                map((response: any) => {
                    const list = (financeAccounts && Array.isArray(financeAccounts)) ? financeAccounts.slice() : [];
                    list.push(response.payload);
                    this._financeAccounts.next(list);
                    return response.payload;
                })
            ))
        );
    }

    updateFinanceAccountBalance(id: string, amount: number): Observable<FinanceAccount> {
        const requestBody = { amount: amount };
        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.put<FinanceAccount>('api/apps/finance/accounts/' + id + '/balance', requestBody).pipe(
                map((updatedCalendar: any) => {
                    if (financeAccounts && Array.isArray(financeAccounts)) {
                        const index = financeAccounts.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeAccounts[index] = updatedCalendar.payload;
                            this._financeAccounts.next(financeAccounts);
                        }
                    }
                    return updatedCalendar.payload;
                })
            ))
        );
    }

    updateFinanceAccount(id: string, financeAccount: FinanceAccount): Observable<FinanceAccount> {
        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.put<FinanceAccount>('api/apps/finance/accounts/' + id, financeAccount).pipe(
                map((updatedFinanceAccount: any) => {
                    if (financeAccounts && Array.isArray(financeAccounts)) {
                        const index = financeAccounts.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeAccounts[index] = updatedFinanceAccount.payload;
                            this._financeAccounts.next(financeAccounts);
                        }
                    }
                    this._financeAccount.next(updatedFinanceAccount.payload);
                    return updatedFinanceAccount.payload;
                })
            ))
        );
    }

    updateActiveFinanceAccount(id: string, request: any) {
        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.put<FinanceAccount>('api/apps/finance/accounts/' + id + '/active', request).pipe(
                map((updatedFinanceAccount: any) => {
                    if (financeAccounts && Array.isArray(financeAccounts)) {
                        const index = financeAccounts.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeAccounts[index] = updatedFinanceAccount.payload;
                            this._financeAccounts.next(financeAccounts);
                        }
                    }
                    this._financeAccount.next(updatedFinanceAccount.payload);
                    return updatedFinanceAccount.payload;
                })
            ))
        );
    }

    updateBalance(id: string, request: any) {
        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.put<FinanceAccount>('api/apps/finance/accounts/' + id + '/balance', request).pipe(
                map((updatedFinanceAccount: any) => {
                    if (financeAccounts && Array.isArray(financeAccounts)) {
                        const index = financeAccounts.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeAccounts[index] = updatedFinanceAccount.payload;
                            this._financeAccounts.next(financeAccounts);
                        }
                    }
                    this._financeAccount.next(updatedFinanceAccount.payload);
                    return updatedFinanceAccount.payload;
                })
            ))
        );
    }

    closeAccount(id: string, request: any) {
        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.put<FinanceAccount>('api/apps/finance/accounts/' + id + '/close', request).pipe(
                map((updatedFinanceAccount: any) => {
                    if (financeAccounts && Array.isArray(financeAccounts)) {
                        const index = financeAccounts.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeAccounts[index] = updatedFinanceAccount.payload;
                            this._financeAccounts.next(financeAccounts);
                        }
                    }
                    this._financeAccount.next(updatedFinanceAccount.payload);
                    return updatedFinanceAccount.payload;
                })
            ))
        );
    }

    deleteFinanceAccount(id: string): Observable<any> {
        return this.financeAccounts$.pipe(
            take(1),
            switchMap(financeAccounts => this._apiClient.delete<FinanceAccount>('api/apps/finance/accounts/' + id).pipe(
                map((isDeleted) => {
                    if (financeAccounts && Array.isArray(financeAccounts)) {
                        const index = financeAccounts.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeAccounts.splice(index, 1);
                            this._financeAccounts.next(financeAccounts);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get categories
     */
    getFinanceCategories(page: number = 1, pageSize: number = 10, categoryId: string | null = null): Observable<FinanceCategory[]> {

        let params: any = { pageNumber: page, pageSize: pageSize, categoryId: '' };

        if (categoryId) {
            params = { pageNumber: page, pageSize: pageSize, categoryId: categoryId };
        }


        return this._apiClient.get<FinanceCategory[]>('api/apps/finance/categories', { params: params })
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._financeCategories.next(payload.data ?? []);
                    this._financeCategoriesPagination.next({
                        pageNumber: page - 1,
                        pageSize: pageSize,
                        totalPages: payload.totalPages,
                        totalRecords: payload.totalRecords,
                        nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                        previousPage: payload.previousPage
                    });
                }),
                map((response: any) => response.payload)
            );
    }

    searchFinanceCategories(searchFilter: SearchFilter): Observable<FinanceCategory[]> {

        return this._apiClient.post<FinanceCategory[]>('api/apps/finance/categories/search', searchFilter)
            .pipe(
                tap((response: any) => {

                    const payload = response.payload;

                    this._financeCategories.next(payload.data ?? []);

                    this._financeCategoriesPagination.next({
                        pageNumber: (searchFilter.paginationFilter?.pageNumber ?? 0) - 1,
                        pageSize: searchFilter.paginationFilter?.pageSize ?? 0,
                        totalPages: payload.totalPages,
                        totalRecords: payload.totalRecords,
                        nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                        previousPage: payload.previousPage
                    });
                }),
                map((response: any) => response.payload)
            );
    }


    getFinanceCategory(id: string): Observable<FinanceCategory> {
        return this._apiClient.get<FinanceCategory>('api/apps/finance/categories/' + id).pipe(
            tap((response: any) => {
                this._financeCategory.next(response.payload ?? null);
            }),
            map((response: any) => response.payload)
        );
    }

    /**
     * Get categories
     */
    getFinanceParentCategories(): Observable<FinanceCategory[]> {
        return this._apiClient.get<FinanceCategory[]>('api/apps/finance/categories/parents').pipe(
            tap((response: any) => {
                this._financeParentCategories.next(response.payload ?? []);
            }),
            map((response: any) => response.payload)
        );
    }

    addFinanceCategory(category: FinanceCategory): Observable<FinanceCategory> {
        // You used CareerUtils.guid() before; keeping as-is since CareerUtils is imported.
        if (!category.id) {
            category.id = CareerUtils.guid();
        }

        return this.financeCategories$.pipe(
            take(1),
            switchMap(categories => this._apiClient.post<FinanceCategory>('api/apps/finance/categories', category).pipe(
                map((response: any) => {
                    const list = (categories && Array.isArray(categories)) ? categories.slice() : [];
                    list.push(response.payload);
                    this._financeCategories.next(list);

                    if (!category.parentId) {
                        this.getFinanceParentCategories().subscribe();
                    }

                    return response.payload;
                })
            ))
        );
    }

    updateFinanceCategory(id: string, category: FinanceCategory): Observable<FinanceCategory> {
        return this.financeCategories$.pipe(
            take(1),
            switchMap(categories => this._apiClient.put<FinanceCategory>('api/apps/finance/categories/' + id, category).pipe(
                map((updatedCalendar: any) => {
                    if (categories && Array.isArray(categories)) {
                        const index = categories.findIndex(item => item.id === id);
                        if (index > -1) {
                            categories[index] = updatedCalendar.payload;
                        }
                    }

                    if (!category.parentId) {
                        this.getFinanceParentCategories().subscribe();
                    }

                    this._financeCategories.next(categories ?? []);

                    return updatedCalendar.payload;
                })
            ))
        );
    }

    deleteFinanceCategory(id: string): Observable<any> {
        return this.financeCategories$.pipe(
            take(1),
            switchMap(categories => this._apiClient.delete<FinanceCategory>('api/apps/finance/categories/' + id).pipe(
                map((isDeleted) => {
                    if (categories && Array.isArray(categories)) {
                        const index = categories.findIndex(item => item.id === id);
                        const category = categories.find(item => item.id === id);
                        if (index > -1) {
                            categories.splice(index, 1);
                        }

                        if (!category?.parentId) {
                            this.getFinanceParentCategories().subscribe();
                        }

                        this._financeCategories.next(categories);
                    }

                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get buckets
     */
    getBuckets(page: number = 1, pageSize: number = 10): Observable<FinanceBucket[]> {

        const params = { pageNumber: page, pageSize: pageSize };

        return this._apiClient.get<FinanceBucket[]>('api/apps/finance/buckets', { params: params })
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._financeBudgets.next(payload.data ?? []);
                    this._financeBudgetsPagination.next({
                        pageNumber: page - 1,
                        pageSize: pageSize,
                        totalPages: payload.totalPages,
                        totalRecords: payload.totalRecords,
                        nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                        previousPage: payload.previousPage
                    });
                }),
                map((response: any) => response.payload)
            );
    }


    searchBuckets(searchFilter: FinanceBucketSearchQuery): Observable<FinanceBucket[]> {

        return this._apiClient.post<FinanceBucket[]>('api/apps/finance/buckets/search', searchFilter)
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._financeBudgets.next(payload.data ?? []);
                    this._financeBudgetsPagination.next({
                        pageNumber: (searchFilter.paginationFilter?.pageNumber ?? 0) - 1,
                        pageSize: searchFilter.paginationFilter?.pageSize ?? 0,
                        totalPages: payload.totalPages,
                        totalRecords: payload.totalRecords,
                        nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                        previousPage: payload.previousPage
                    });
                }),
                map((response: any) => response.payload)
            );
    }

    getBucketsByAccountId(accountId: string) {
        return this._apiClient.get<FinanceBucket[]>('api/apps/finance/accounts/' + accountId + '/buckets')
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._financeBudgets.next(payload ?? []);
                }),
                map((response: any) => response.payload)
            );
    }


    addBucket(request: any): Observable<FinanceBucket> {
        return this.financeBuckets$.pipe(
            take(1),
            switchMap(buckets => this._apiClient.post<FinanceBucket>('api/apps/finance/buckets', request).pipe(
                map((response: any) => response.payload)
            ))
        );
    }

    updateBucket(id: string, request: any): Observable<FinanceBucket> {
        return this.financeBuckets$.pipe(
            take(1),
            switchMap(buckets => this._apiClient.put<FinanceBucket>('api/apps/finance/buckets/' + id, request).pipe(
                map((updated: any) => updated.payload)
            ))
        );
    }

    completeBucket(id: string): Observable<FinanceBucket> {
        return this.financeBuckets$.pipe(
            take(1),
            switchMap(buckets => this._apiClient.put<FinanceBucket>('api/apps/finance/buckets/' + id + '/complete', null).pipe(
                map((updated: any) => updated.payload)
            ))
        );
    }

    deleteBucket(id: string): Observable<any> {
        return this.financeBuckets$.pipe(
            take(1),
            switchMap(buckets => this._apiClient.delete<FinanceBucket>('api/apps/finance/buckets/' + id).pipe(
                map((isDeleted) => {
                    if (buckets && Array.isArray(buckets)) {
                        const index = buckets.findIndex(item => item.id === id);
                        if (index > -1) {
                            buckets.splice(index, 1);
                            this._financeBudgets.next(buckets);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }


    getBucket(id: string): Observable<FinanceBucket> {
        return this._apiClient.get<FinanceBucket>('api/apps/finance/buckets/' + id).pipe(
            tap((response: any) => {
                this._financeBudget.next(response.payload ?? null);
            }),
            map((response: any) => response.payload)
        );
    }

    getBucketStat(id: string): Observable<any> {
        return this._apiClient.get<any>('api/apps/finance/buckets/' + id + '/stats').pipe(
            tap((response: any) => {
                this._financeBudget.next(response.payload ?? null);
            }),
            map((response: any) => response.payload)
        );
    }

    assignBucket(bucket: any) {
        return this.financeTransactions$.pipe(
            take(1),
            switchMap(financeTransactions => this._apiClient.put<FinanceTransaction>('api/apps/finance/transactions/buckets/assign', bucket).pipe(
                map((updated: any) => {
                    if (financeTransactions && Array.isArray(financeTransactions)) {
                        const index = financeTransactions.findIndex(item => item.id === bucket.TransactionId);
                        if (index > -1) {
                            financeTransactions[index] = updated.payload;
                            this._financeTransactions.next(financeTransactions);
                        }
                    }
                    return updated.payload;
                })
            ))
        );
    }

    getBanks(): Observable<Bank[]> {
        return this._apiClient.get<Bank[]>('api/apps/finance/banks').pipe(
            tap((response: any) => {
                this._banks.next(response.payload ?? []);
            }),
            map((response: any) => response.payload)
        );
    }


    addBank(bank: Bank): Observable<Bank> {
        return this.banks$.pipe(
            take(1),
            switchMap(banks => this._apiClient.post<Bank>('api/apps/finance/banks', bank).pipe(
                map((response: any) => {
                    const list = (banks && Array.isArray(banks)) ? banks.slice() : [];
                    list.push(response.payload);
                    this._banks.next(list);
                    return response.payload;
                })
            ))
        );
    }

    updateBank(id: string, bank: Bank): Observable<Bank> {
        return this.banks$.pipe(
            take(1),
            switchMap(banks => this._apiClient.put<Bank>('api/apps/finance/banks/' + id, bank).pipe(
                map((updated: any) => {
                    if (banks && Array.isArray(banks)) {
                        const index = banks.findIndex(item => item.id === id);
                        if (index > -1) {
                            banks[index] = updated.payload;
                            this._banks.next(banks);
                        }
                    }
                    return updated.payload;
                })
            ))
        );
    }

    deleteBank(id: string): Observable<any> {
        return this.banks$.pipe(
            take(1),
            switchMap(banks => this._apiClient.delete<Bank>('api/apps/finance/banks/' + id).pipe(
                map((isDeleted) => {
                    if (banks && Array.isArray(banks)) {
                        const index = banks.findIndex(item => item.id === id);
                        if (index > -1) {
                            banks.splice(index, 1);
                            this._banks.next(banks);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }

    searchFinanceBanks(searchFilter: SearchFilter): Observable<CareerQueryResponse<FinanceBank>> {
        return this._apiClient.post<CareerQueryResponse<FinanceBank>>('api/apps/finance/financebanks/search', searchFilter);
    }

    getFinanceBank(id: string): Observable<ApiResponse> {
        return this._apiClient.get<ApiResponse>('api/apps/finance/financebanks/' + id).pipe(
            tap((response: ApiResponse) => {
                this._financeBank.next(response.payload ?? null);
            }),
            map((response: any) => response.payload)
        );
    }

    addFinanceBank(financeBank: FinanceBank): Observable<FinanceBank> {
        return this.financeBanks$.pipe(
            take(1),
            switchMap((financeBanks) => this._apiClient.post<FinanceBank>('api/apps/finance/financebanks', financeBank).pipe(
                map((response: any) => {
                    const list = (financeBanks && Array.isArray(financeBanks)) ? financeBanks.slice() : [];
                    list.push(response.payload);
                    this._financeBanks.next(list);
                    return response.payload;
                })
            ))
        );
    }

    updateFinanceBank(id: string, financeBank: FinanceBank): Observable<FinanceBank> {
        return this.financeBanks$.pipe(
            take(1),
            switchMap(financeBanks => this._apiClient.put<FinanceBank>('api/apps/finance/financebanks/' + id, financeBank).pipe(
                map((updated: any) => {
                    if (financeBanks && Array.isArray(financeBanks)) {
                        const index = financeBanks.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeBanks[index] = updated.payload;
                            this._financeBanks.next(financeBanks);
                        }
                    }
                    this._financeBank.next(updated.payload);
                    return updated.payload;
                })
            ))
        );
    }

    deleteFinanceBank(id: string): Observable<any> {
        return this.financeBanks$.pipe(
            take(1),
            switchMap(financeBanks => this._apiClient.delete<FinanceBank>('api/apps/finance/financebanks/' + id).pipe(
                map((isDeleted) => {
                    if (financeBanks && Array.isArray(financeBanks)) {
                        const index = financeBanks.findIndex(item => item.id === id);
                        if (index > -1) {
                            financeBanks.splice(index, 1);
                            this._financeBanks.next(financeBanks);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }

    searchAccount(searchFilter: FinanceAccountSearchFilter) {
        return this._apiClient.post<FinanceAccount[]>('api/apps/finance/accounts/search', searchFilter);
    }

    categoryStats(request: any): Observable<CategoryStat> {
        const url = `api/apps/finance/stats/categories`;
        return this._apiClient.post<CategoryStat>(url, request);
    }

    bucketStats(bucketId: any) {
        const url = `api/apps/finance/stats/buckets/${bucketId}`;
        return this._apiClient.get<FinanceBucketStats>(url);
    }

    financePlannedPaymentItemStats(request: any) {
        const url = `api/apps/finance/stats/planned-payments/items`;
        return this._apiClient.post<FinancePlannedPaymentItemStatsResponse>(url, request);
    }

    getCardsByAccountId(accountId: string): Observable<Card[]> {
        return this._apiClient.get<Card[]>('api/apps/finance/accounts/' + accountId + '/cards')
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._cards.next(payload ?? []);
                }),
                map((response: any) => response.payload)
            );
    }

    addCard(accountId: string, request: any): Observable<Card> {
        const url = `api/apps/finance/accounts/${accountId}/cards`;

        return this.cards$.pipe(
            take(1),
            switchMap((cards) => this._apiClient.post<Card>(url, request).pipe(
                map((response: any) => {
                    const list = (cards && Array.isArray(cards)) ? cards.slice() : [];
                    list.push(response.payload);
                    this._cards.next(list);
                    return response.payload;
                })
            ))
        );
    }

    updateCard(accountId: string, cardId: string, request: any): Observable<Card> {
        const url = `api/apps/finance/accounts/${accountId}/cards/${cardId}`;
        return this.cards$.pipe(
            take(1),
            switchMap(cards => this._apiClient.put<Card>(url, request).pipe(
                map((updated: any) => {
                    if (cards && Array.isArray(cards)) {
                        const index = cards.findIndex(item => item.id === cardId);
                        if (index > -1) {
                            cards[index] = updated.payload;
                            this._cards.next(cards);
                        }
                    }
                    return updated.payload;
                })
            ))
        );

    }

    deleteCard(accountId: string, cardId: string): Observable<boolean> {
        const url = `api/apps/finance/accounts/${accountId}/cards/${cardId}`;

        return this.cards$.pipe(
            take(1),
            switchMap(cards => this._apiClient.delete<boolean>(url).pipe(
                map((isDeleted) => {
                    if (cards && Array.isArray(cards)) {
                        const index = cards.findIndex(item => item.id === cardId);
                        if (index > -1) {
                            cards.splice(index, 1);
                            this._cards.next(cards);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }

    searchFinancePlannedPayments(searchFilter: SearchFilter) {
        return this._apiClient.post<FinancePlannedPayment[]>('api/apps/finance/planned-payments/search', searchFilter)
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._financePlannedPayments.next(payload.data ?? []);
                    this._financePlannedPaymentPagination.next({
                        pageNumber: (searchFilter.paginationFilter?.pageNumber ?? 0) - 1,
                        pageSize: searchFilter.paginationFilter?.pageSize ?? 0,
                        totalPages: payload.totalPages,
                        totalRecords: payload.totalRecords,
                        nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                        previousPage: payload.previousPage
                    });
                }),
                map((response: any) => response.payload)
            );
    }

    createPlannedPayment(request: any): Observable<FinancePlannedPayment> {
        const url = `api/apps/finance/planned-payments`;

        return this.financePlannedPayments$.pipe(
            take(1),
            switchMap((plannedPayments) => this._apiClient.post<FinancePlannedPayment>(url, request).pipe(
                map((response: any) => {
                    const list = (plannedPayments && Array.isArray(plannedPayments)) ? plannedPayments.slice() : [];
                    list.push(response.payload);
                    this._financePlannedPayments.next(list);
                    return response.payload;
                })
            ))
        );
    }

    updatePlannedPayment(id: string, request: any): Observable<FinancePlannedPayment> {
        const url = `api/apps/finance/planned-payments/${id}`;
        return this.financePlannedPayments$.pipe(
            take(1),
            switchMap(plannedPayments => this._apiClient.put<FinancePlannedPayment>(url, request).pipe(
                map((updated: any) => {
                    if (plannedPayments && Array.isArray(plannedPayments)) {
                        const index = plannedPayments.findIndex(item => item.id === id);
                        if (index > -1) {
                            plannedPayments[index] = updated.payload;
                            this._financePlannedPayments.next(plannedPayments);
                        }
                    }
                    this._financePlannedPayment.next(updated.payload);
                    return updated.payload;
                })
            ))
        );

    }

    deletePlannedPayment(id: string): Observable<boolean> {
        return this.financePlannedPayments$.pipe(
            take(1),
            switchMap(plannedPayments => this._apiClient.delete<boolean>('api/apps/finance/planned-payments/' + id).pipe(
                map((isDeleted) => {
                    if (plannedPayments && Array.isArray(plannedPayments)) {
                        const index = plannedPayments.findIndex(item => item.id === id);
                        if (index > -1) {
                            plannedPayments.splice(index, 1);
                            this._financePlannedPayments.next(plannedPayments);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }

    getFinancePlannedPayment(id: string): Observable<FinancePlannedPayment> {
        return this._apiClient.get<FinancePlannedPayment>('api/apps/finance/planned-payments/' + id).pipe(
            tap((response: any) => {
                this._financePlannedPayment.next(response.payload ?? null);
            }),
            map((response: any) => response.payload)
        );
    }

    searchFinancePlannedPaymentItems(searchFilter: FinancePlannedPaymentItemSearchFilter) {
        return this._apiClient.post<any>('api/apps/finance/planned-payments/items/search', searchFilter).pipe(
            tap((response: any) => {
                const payload = response.payload?.data ?? { data: [], totalPages: 0, totalRecords: 0, nextPage: null, previousPage: null };

                this._financePlannedPaymentItemPagination.next({
                    pageNumber: (searchFilter.paginationFilter?.pageNumber ?? 0) - 1,
                    pageSize: searchFilter.paginationFilter?.pageSize ?? 0,
                    totalPages: payload.totalPages,
                    totalRecords: payload.totalRecords,
                    nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                    previousPage: payload.previousPage
                });

                this._financePlannedPaymentItems.next(payload.data ?? []);

            }),
            map((response: any) => response.payload)
        );
    }

    markAsCompletedPlannedPaymentItem(id: string, itemId: string, request: any): Observable<FinancePlannedPayment> {
        const url = `api/apps/finance/planned-payments/${id}/items/${itemId}/complete`;

        return this.financePlannedPaymentItems$.pipe(
            take(1),
            switchMap(items => this._apiClient.put<FinancePlannedPayment>(url, request).pipe(
                map((updated: any) => {
                    if (items && Array.isArray(items)) {
                        const index = items.findIndex(item => item.id === itemId);
                        if (index > -1) {
                            items[index] = updated.payload;
                            this._financePlannedPaymentItems.next(items);
                        }
                    }
                    return updated.payload;
                })
            ))
        );
    }

    deletePlannedPaymentItem(id: string, itemId: string): Observable<boolean> {
        const url = `api/apps/finance/planned-payments/${id}/items/${itemId}`;

        return this.financePlannedPaymentItems$.pipe(
            take(1),
            switchMap(items => this._apiClient.delete<boolean>(url).pipe(
                map((isDeleted) => {
                    if (items && Array.isArray(items)) {
                        const index = items.findIndex(item => item.id === itemId);
                        if (index > -1) {
                            items.splice(index, 1);
                            this._financePlannedPaymentItems.next(items);
                        }
                    }
                    return isDeleted;
                })
            ))
        );
    }

    searchFinanceInstallmentPlans(searchFilter: FinanceInstallmentPlanSearchFilter) {
        return this._apiClient.post<FinanceInstallmentPlanDto[]>('api/apps/finance/installment-plans/search', searchFilter)
            .pipe(
                tap((response: any) => {
                    const payload = response.payload;
                    this._financeInstallmentPlans.next(payload.data ?? []);
                    this._financeInstallmentPlanPagination.next({
                        pageNumber: (searchFilter.paginationFilter?.pageNumber ?? 0) - 1,
                        pageSize: searchFilter.paginationFilter?.pageSize ?? 0,
                        totalPages: payload.totalPages,
                        totalRecords: payload.totalRecords,
                        nextPage: (payload.nextPage != null) ? payload.nextPage - 1 : null,
                        previousPage: payload.previousPage
                    });
                }),
                map((response: any) => response.payload)
            );
    }

    getInstallmentDetails(planId: string): Observable<FinanceInstallmentDetailDto[]> {
        const url = `api/apps/finance/installment-plans/${planId}/details`;
        return this._apiClient.get<FinanceInstallmentDetailDto[]>(url);
    }

    paymentInstallmentDetails(planId: string, detailId: string, request: any) {
        const url = `api/apps/finance/installment-plans/${planId}/details/${detailId}/payment`;
        return this._apiClient.put<FinanceInstallmentPlanDto>(url, request);
    }

    getFilters(screenName: string): Observable<any> {
        return this._apiClient
            .get<any>('api/screen/' + screenName + '/filters')
            .pipe(
                tap((response: any) => {
                    this._filterConfig.next(response.payload ?? null);
                }),
                map((response: any) => response.payload)
            );
    }

    searchTransactionsV2(searchFilter: any): Observable<any> {
        return this._apiClient.post<any>('api/apps/finance/v2/transactions/search', searchFilter);
    }
}
