// src/types/PlacementTest.type.ts

export interface Field {
    fieldId: number;
    name: string;
    description?: string;
    placementTests?: PlacementTest[];
}

export interface AddFieldRequest {
    name: string;
    description?: string;
}

export interface PlacementTest {
    placementTestId: number;
    fieldId: number;
    title: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    field?: Field;
    placementQuestions?: PlacementQuestion[];
    questionCount: number;

}

export interface AddPlacementTestRequest {
    fieldId: number;
    title: string;
    description?: string;
}

export interface UpdatePlacementTestRequest {
    placementTestId: number;
    title?: string;
    description?: string;
    isActive?: boolean;
}

export interface PlacementQuestion {
    questionId: number;
    placementTestId: number;
    questionText: string;
    answerOptions: string;
    correctAnswer: string;
    difficultyLevel: number;
    imageUrl?: string;
}

export interface AddPlacementQuestionRequest {
    placementTestId: number;
    questionText: string;
    answerOptions: string;
    correctAnswer: string;
    difficultyLevel: number;
    imageUrl?: string;
}
