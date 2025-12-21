export interface Category {
    id?: string;
    title?: string;
    slug?: string;
    color?: string;
}

export interface CourseStep {
    id?: string;
    courseId?: string;
    title?: string;
    subTitle?: string;
    content?: string;
    order?: number;
}

export interface Course {
    id?: string;
    title?: string;
    slug?: string;
    description?: string;
    category?: string;
    duration?: number;
    steps?: {
        id?:string;
        order?: number;
        title?: string;
        subtitle?: string;
        content?: string;
    }[];
    totalSteps?: number;
    updatedAt?: number;
    featured?: boolean;
    progress?: {
        currentStep?: number;
        completed?: number;
    };
}
