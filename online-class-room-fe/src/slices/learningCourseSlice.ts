import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, Step } from '../types/Course.type';
import { CheckRegistrationCourseRespone } from '../types/RegistrationCourse.type';

export enum LessionType {
    QUIZ,
    VIDEO,
    DONE,
}

export interface learningCourseSliceData {
    learningCourse: Course;
    stepActive: Step;
    stepActiveType: LessionType;
    registrationData: CheckRegistrationCourseRespone | null;
    isVideoWatched: boolean;
}
export interface LearningStateDto {
    registrationId: number;
    courseId: number;
    learningProgress: number;
    isCompleted: boolean;
    completedStepIds: number[];
    currentStepId: number;
}

const initialStep: Step = {
    duration: 0,
    position: 0,
    quiz: '',
    quizId: 0,
    section: '',
    sectionId: -1,
    stepDescription: '',
    stepId: -1,
    title: '',
    videoUrl: '',
};

const initialCourse: Course = {
    accountId: '',
    courseIsActive: false,
    description: '',
    imageUrl: '',
    isPublic: false,
    knowdledgeDescription: '',
    linkCertificated: '',
    price: 0,
    salesCampaign: 0,
    title: '',
    totalDuration: 0,
    videoPreviewUrl: '',
    courseCategories: [],
    courseId: 0,
    createAt: '',
    linkCertificateAccounts: [],
    orders: [],
    publicAt: '',
    registrationCourses: [],
    sections: [],
    updateAt: '',
    wishLists: [],
};

const initialState: learningCourseSliceData = {
    learningCourse: initialCourse,
    stepActive: initialStep,
    stepActiveType: LessionType.VIDEO,
    registrationData: null,
    isVideoWatched: false,
};

export const learningCourseSlice = createSlice({
    name: 'learningCourse',
    initialState,
    reducers: {
        setVideoWatched: (state, action: PayloadAction<boolean>) => {
            state.isVideoWatched = action.payload;
        },

        setLearingCourse: (state, action: PayloadAction<Course>) => {
            state.learningCourse = action.payload;
        },

        setRegistrationData: (
            state,
            action: PayloadAction<CheckRegistrationCourseRespone>,
        ) => {
            state.registrationData = action.payload;
        },

        setStepActiveByStepId: (state, action: PayloadAction<number>) => {
            for (const section of state.learningCourse.sections) {
                const step = section.steps.find(
                    (s) => s.stepId === action.payload,
                );
                if (step) {
                    state.stepActive = step;
                    state.stepActiveType =
                        step.quizId !== null
                            ? LessionType.QUIZ
                            : LessionType.VIDEO;
                    state.isVideoWatched = false;
                    return;
                }
            }
        },
    },
});

export const {
    setLearingCourse,
    setVideoWatched,
    setRegistrationData,
    setStepActiveByStepId,
} = learningCourseSlice.actions;

export default learningCourseSlice.reducer;
