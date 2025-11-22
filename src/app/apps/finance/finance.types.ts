import {CareerDataPagination, DateTimeRangeFilter, SearchFilter} from "@/core/pagination/personal-book.pagination";


export interface CurrencyCode {
    id?: string;
    name?: string;
    code?: string;
    icon?: string;
}

export interface FinanceCategory {
    id?: string;
    parentId?: string;
    name?: string;
    color?: string
    slug?: string;
    icon?: string;
}

export interface FinanceCategoryRef {
    id?: string;
    name?: string;
    color?: string
}

export class IdNameRef {
    id?: string;
    name?: string;
}

export interface FinanceBucket {
    id?: string | undefined;
    name?: string;
    month?: number;
    year?: number;
    periodStartTime?: string;
    account?: IdNameRef;
    startDate?: string;
    endDate?: string;
    expectedIncomeAmount?: Money
    expectedExpenseAmount?: Money
    expectedTransferAmount?: Money;
    expectedCreditCardPaymentAmount?: Money;
    expectedCreditAmount?: Money;
    isCompleted?: boolean;
    incomes?: FinanceBucketCategory[];
    expenses?: FinanceBucketCategory[];
    createdDate?: string;
    modifiedDate?: string;
}

export interface FinanceBucketCategory {
    category?: IdNameRef;
    amount: Money;
}


export interface FinanceTransaction {
    id?: string;
    type?: number;
    bucket?: IdNameRef;
    fromAccount?: IdNameRef;
    fromBank?: IdNameRef;
    toAccount?: IdNameRef;
    toBank?: IdNameRef;
    category?: FinanceCategoryRef;
    parentCategory?: FinanceCategoryRef;
    transactionAmount: Money;
    transactionFeeAmount: Money;
    transactionTransferredAmount: Money;
    exchangeRate?: number;
    installmentCount?: number;
    startDate?: string;
    note?: string;
    transactionDate?: string;
    createdDate: string;
    transactionNumber: string;
}

export interface FinanceTransactionFilter {
    financeBankId?: string;
    financeAccountId?: string;
    financeBucketId?: string;
    financeCategoryId?: string;
    dateTimeRange?: DateTimeRangeFilter
}

export interface FinanceTransactionSearchFilter extends SearchFilter {
    filter?: FinanceTransactionFilter
}

export interface BankRef {
    id: string;
    name: string;
    code: string;
    logo: string;
}

export interface FinanceBank {
    id?: string;
    bank?: BankRef
    name?: string;
    description?: string;
    isActive: boolean;
    createdDate?: string;
    modifiedDate?: string;
}


export interface FinanceBankRef {
    id: string;
    name: string;
    bank: BankRef;
}


export interface FinanceAccount {
    id?: string;
    financeBank?: FinanceBankRef;
    type?: number;
    name?: string;
    description?: string;
    branchName?: string;
    balance?: number;
    currencyCode?: string;
    openingDate?: string;
    closingDate?: string;
    createdDate?: string;
    modifiedDate?: string;
    isActive?: boolean;
}


export interface CreateTransactionDto {
    type: number;
    fromAccount: IdNameRef;
    toAccount: IdNameRef;
    category: IdNameRef;
    parentCategory: IdNameRef;
    amount: number;
    note: string;
    tag: IdNameRef;
    transactionDate: string;
    fee?: number;
    exchangeRate?: number;
}

export interface Money {
    amount: number;
    currencyCode: string;
}

export class DateTimeRangeTypeDto {
    id: number;
    name: string;
    displayName: string;

    constructor(id: number, displayName: string, name: string) {

        this.id = id;
        this.name = name;
        this.displayName = displayName;
    }
}

export class DateTimeRangeType {
    static All: DateTimeRangeTypeDto[] = new Array<DateTimeRangeTypeDto>(
        new DateTimeRangeTypeDto(1, "Last 7 Day", "Last7Day"),
        new DateTimeRangeTypeDto(2, "Last 30 Day", "Last30Day"),
        new DateTimeRangeTypeDto(3, "Last 6 Month", "Last6Month"),
        new DateTimeRangeTypeDto(4, "Last 12 Month", "Last12Month"),
        new DateTimeRangeTypeDto(5, "Current Day", "CurrentDay"),
        new DateTimeRangeTypeDto(6, "Current Week", "CurrentWeek"),
        new DateTimeRangeTypeDto(7, "Current Month", "CurrentMonth"),
        new DateTimeRangeTypeDto(8, "Current Year", "CurrentYear"),
        new DateTimeRangeTypeDto(9, "Range", "Range"),
        new DateTimeRangeTypeDto(10, "Next 7 Day", "Next7Day"),
        new DateTimeRangeTypeDto(11, "Next 30 Day", "Next30Day"),
        new DateTimeRangeTypeDto(12, "Next 6 Month", "Next6Month"),
        new DateTimeRangeTypeDto(13, "Next 12 Month", "Next12Month"),
    )
}

export class FinanceAccountTypeDto {
    id: number;
    name: string;
    displayName: string;

    constructor(id: number, displayName: string, name: string) {

        this.id = id;
        this.name = name;
        this.displayName = displayName;
    }
}

export class FinanceAccountType {
    static CurrentAccount = new FinanceAccountTypeDto(0, "Current Account", "CurrentAccount");
    static CreditCardAccount = new FinanceAccountTypeDto(1, "Credit Card Account", "CreditCardAccount");
    static LoanAccount = new FinanceAccountTypeDto(2, "Loan Account", "LoanAccount");

    static All: FinanceAccountTypeDto[] = new Array<FinanceAccountTypeDto>(
        FinanceAccountType.CurrentAccount,
        FinanceAccountType.CreditCardAccount,
        FinanceAccountType.LoanAccount
    )
}

export class FinanceTransactionTypeDto {
    id: number;
    name: string;
    displayName: string;
    icon: string;

    constructor(id: number, displayName: string, name: string, icon: string) {

        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.icon = icon;
    }
}


export class FinanceTransactionType {
    static Income = new FinanceTransactionTypeDto(1, "Income", "Income", "first_page");
    static Expense = new FinanceTransactionTypeDto(2, "Expense", "Expense", "last_page");
    static Transfer = new FinanceTransactionTypeDto(3, "Transfer", "Transfer", "cached");
    static CreditCardPayment = new FinanceTransactionTypeDto(4, "Credit Card Payment", "CreditCardPayment", "heroicons_outline:credit-card");
    static Credit = new FinanceTransactionTypeDto(5, "Credit", "Credit", "account_balance");
    static Savings = new FinanceTransactionTypeDto(6, "Savings", "Savings", "payments");

    static All: FinanceTransactionTypeDto[] = new Array<FinanceTransactionTypeDto>(
        FinanceTransactionType.Income,
        FinanceTransactionType.Expense,
        FinanceTransactionType.Transfer,
        FinanceTransactionType.CreditCardPayment,
        FinanceTransactionType.Credit,
        FinanceTransactionType.Savings
    );
}

export class Stat {
    items?: StatItem[];
    totalValue?: number;
    startDate?: string;
    endDate?: string;
}

export class StatItem {
    label?: string;
    value?: number;
    color?: string;
}

export class CategoryIndex {
    index?: number;
    categories?: any[];
}

export class BucketStatInformation {
    totalActualAmount?: number;
    totalExpectedAmount?: number;
    totalCompletedExpectedAmount?: number;
    totalBucketNumber?: number;
    currencyCode?: string;

    /**
     *
     */
    constructor() {
        this.totalActualAmount = 0;
        this.totalExpectedAmount = 0;
        this.totalBucketNumber = 0;
        this.totalCompletedExpectedAmount = 0;
        this.currencyCode = "";
    }
}


export interface Bank {
    id?: string;
    name?: string;
    code?: string;
    description?: string;
    logo?: string;
    color?: string;
    phoneNumber?: string;
    website?: string;
}

export interface BankRef {
    id: string;
    name: string;
    code: string;
    logo: string;
}

export interface FinanceAccountSearchQueryFilter {
    financeBankId?: string;
    types?: number[];
}

export interface FinanceAccountSearchFilter extends SearchFilter {
    filter?: FinanceAccountSearchQueryFilter
}

export interface CategoryStatItem {
    type: number;
    totalValue: number;
    items: StatItem[];
}


export interface CategoryStat {
    startDate: string;
    endDate: string;
    totalValue: number;
    statItems: CategoryStatItem[];
}


export class FinancePlannedPaymentItemStatusDto {
    id: number;
    name: string;
    displayName: string;
    color: any;

    constructor(id: number, displayName: string, name: string, color: any) {

        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.color = color;
    }
}


export class FinancePlannedPaymentItemStatus {
    static Created = new FinancePlannedPaymentItemStatusDto(0, "Created", "Created", "primary");
    static NotificationSent = new FinancePlannedPaymentItemStatusDto(1, "NotificationSent", "NotificationSent", "primary");
    static NotificationSentError = new FinancePlannedPaymentItemStatusDto(2, "NotificationSentError", "NotificationSentError", "warn");
    static Delay = new FinancePlannedPaymentItemStatusDto(3, "Delay", "Delay", "warn");
    static Error = new FinancePlannedPaymentItemStatusDto(4, "Error", "Error", "warn");
    static Completed = new FinancePlannedPaymentItemStatusDto(5, "Completed", "Completed", "success");

    static All: FinancePlannedPaymentItemStatusDto[] = new Array<FinancePlannedPaymentItemStatusDto>(
        FinancePlannedPaymentItemStatus.Created,
        FinancePlannedPaymentItemStatus.NotificationSent,
        FinancePlannedPaymentItemStatus.NotificationSentError,
        FinancePlannedPaymentItemStatus.Delay,
        FinancePlannedPaymentItemStatus.Error,
        FinancePlannedPaymentItemStatus.Completed
    );
}

export interface FinancePlannedPayment {
    id?: string;
    name?: string;
    account?: IdNameRef;
    bank?: IdNameRef;
    bucket?: IdNameRef;
    category?: FinanceCategoryRef;
    parentCategory?: FinanceCategoryRef;
    type?: number;
    linkedFinanceInstallmentPlan?: IdNameRef;
    amount?: Money;
    isManual?: boolean;
    note?: string;
    source?: string;
    startDate?: string;
    end?: string;
    recurrenceRule?: string;
    createdDate?: string;
    modifiedDate?: string;
    isActive?: boolean;
}

export interface FinanceTransactionRef {
    id?: string;
    transactionNumber?: string
}


export interface FinancePlannedPaymentItem {
    id?: string;
    financePlannedPaymentId?: string;
    status?: FinancePlannedPaymentItemStatus,
    linkedFinanceTransaction: FinanceTransactionRef
    account?: IdNameRef;
    bank?: IdNameRef;
    category?: FinanceCategoryRef;
    parentCategory?: FinanceCategoryRef;
    type?: number;
    linkedFinanceInstallmentPlan?: IdNameRef;
    linkedFinanceInstallmentPlanDetailId?: string;
    name?: string;
    amount?: Money
    paidAmount?: Money
    dueDate?: string;
    createdDate?: string;
    modifiedDate?: string;
}

export class FinancePlannedItemSearchResponse {
    data?: CareerDataPagination<FinancePlannedPaymentItem>;
    request: any;
}

export class StatusMoneyItem {
    status?: number;
    amount?: number;
    count?: number;
}

export class FinancePlannedPaymentItemsStatsTransactionItem {
    type?: number;
    amount?: number;
    count?: number;
    statues?: StatusMoneyItem[];
}


export class FinancePlannedPaymentItemStatsResponseItem {
    currencyCode?: string;
    count?: number;
    transactions?: FinancePlannedPaymentItemsStatsTransactionItem[];
}

export class FinancePlannedPaymentItemStatsResponse {
    data?: FinancePlannedPaymentItemStatsResponseItem[];
    request: any;
}


export interface FinanceBucketCategoryStats {
    type: number;
    totalExpectedAmount: Money;
    totalActualAmount: Money;
    totalTransactionCount: number;
}

export interface FinanceBucketStats {
    bucket: FinanceBucket;
    items: FinanceBucketCategoryStats[];
}

export interface FinanceBucketSearchFilter {
    financeAccountId?: string
}

export interface FinanceBucketSearchQuery extends SearchFilter {
    filter?: FinanceBucketSearchFilter
}

export interface Card {
    id?: string;
    cardNumber?: string;
    cardHolderName?: string;
    cardType?: string;
    expirationMonth?: number;
    expirationYear?: number;
    expirationDate?: string;
    cardValidationValue?: string;
    createdDate?: string;
    modifiedDate?: string;
    isActive?: boolean
}


export class CardTypeDto {
    id: number;
    name: string;
    displayName: string;
    logo: string

    constructor(id: number, displayName: string, name: string, logo: string) {

        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.logo = logo;
    }
}


export class CardType {
    static Visa = new CardTypeDto(0, "Visa", "visa", "assets/images/apps/finance/visa.svg");
    static Mastercard = new CardTypeDto(1, "Mastercard", "mastercard", "assets/images/apps/finance/mastercard.svg");
    static AmericanExpress = new CardTypeDto(2, "American Express", "american-express", "assets/images/apps/finance/american-express.svg");

    static All: CardTypeDto[] = new Array<CardTypeDto>(
        CardType.Visa,
        CardType.Mastercard,
        CardType.AmericanExpress
    );
}


export interface FinancePlannedPayment {
    id?: string;
    name?: string;
    account?: IdNameRef;
    bank?: IdNameRef;
    bucket?: IdNameRef;
    category?: FinanceCategoryRef;
    parentCategory?: FinanceCategoryRef;
    type?: number;
    linkedFinanceInstallmentPlan?: IdNameRef;
    amount?: Money;
    isManual?: boolean;
    note?: string;
    source?: string;
    startDate?: string;
    end?: string;
    recurrenceRule?: string;
    createdDate?: string;
    modifiedDate?: string;
    isActive?: boolean;
}

export interface FinancePlannedPaymentItem {
    id?: string;
    financePlannedPaymentId?: string;
    status?: FinancePlannedPaymentItemStatus,
    linkedFinanceTransaction: FinanceTransactionRef
    account?: IdNameRef;
    bank?: IdNameRef;
    category?: FinanceCategoryRef;
    parentCategory?: FinanceCategoryRef;
    type?: number;
    linkedFinanceInstallmentPlan?: IdNameRef;
    linkedFinanceInstallmentPlanDetailId?: string;
    name?: string;
    amount?: Money
    paidAmount?: Money
    dueDate?: string;
    createdDate?: string;
    modifiedDate?: string;
}

export interface FinancePlannedPaymentItemSearchFilter extends SearchFilter {
    filter?: FinancePlannedPaymentItemSearchQuery
}

export interface FinancePlannedPaymentItemSearchQuery {
    dateTimeRange?: DateTimeRangeFilter;
    financePlannedPaymentId?: string;
    financeBankId?: string;
    financeAccountId?: string;
    financeCategoryId?: string;
    statues?: number[];
}


export interface FinanceInstallmentPlanDto {
    id?: string;
    account?: IdNameRef;
    bank?: IdNameRef;
    name?: string;
    totalAmount?: number;
    principalTotalAmount?: number;
    interestAmount?: number;
    totalPaidAmount?: number;
    interestRate?: number;
    installmentCount?: number;
    currencyCode?: string;
    startDate?: string;
    endDate?: string;
    createdDate?: string;
    modifiedDate?: string;
    isCompleted?: boolean;
    completeRate?: number;
}

export interface FinanceInstallmentDetailDto {
    id?: string;
    name?: string;
    month?: number;
    year?: number;
    installmentNumber?: number;
    amount?: number;
    paidAmount?: number;
    currencyCode?: string;
    dueDate?: string;
    paymentDate?: string;
    isPaid: boolean;
    linkedTransaction: FinanceTransactionRef;
}

export interface FinanceInstallmentPlanSearchFilter extends SearchFilter
{
    filter? : FinanceInstallmentPlanSearchQuery
}

export interface FinanceInstallmentPlanSearchQuery {
    financeBankId? : string;
    financeAccountId?: string;
}






