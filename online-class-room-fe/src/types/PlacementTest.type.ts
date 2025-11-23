// ===============================
// src/types/PlacementTest.type.ts
// ===============================

// ❌ Field đã bị xoá khỏi hệ thống, bỏ toàn bộ interface Field
// ❌ Xóa luôn AddFieldRequest

// ===============================
// CATEGORY
// ===============================
export interface Category {
    categoryId: number;
    name: string;
    description?: string;
}

// ===============================
// PLACEMENT TEST
// ===============================
export interface PlacementTest {
    placementTestId: number;

    // ✔ fieldId → categoryId
    categoryId: number;

    // ✔ thêm categoryName để FE hiển thị list
    categoryName?: string;

    title: string;
    description?: string;
    isActive: boolean;
    createdAt: string;

    placementQuestions?: PlacementQuestion[];
    questionCount: number;
}

export interface AddPlacementTestRequest {
    // ✔ dùng categoryId
    categoryId: number;

    title: string;
    description?: string;
}

export interface UpdatePlacementTestRequest {
    placementTestId: number;

    // ✔ categoryId cho phép sửa khi chưa active
    categoryId?: number;

    title?: string;
    description?: string;
    isActive?: boolean;
}

// ===============================
// PLACEMENT QUESTION
// ===============================
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
