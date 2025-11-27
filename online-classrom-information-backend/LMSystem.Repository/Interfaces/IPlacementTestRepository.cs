using LMSystem.Repository.Data;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface IPlacementTestRepository
    {
        // ===== REMOVED FIELD =====
        // Field is no longer used. These methods are removed.
        // Task<ResponeModel> AddField(string name, string? description);
        // Task<IEnumerable<object>> GetAllFields();
        // Task<ResponeModel> DeleteField(int fieldId);
        // Task<ResponeModel> UpdateField(int fieldId, string name, string? description);

        // ===== PLACEMENT TEST =====
        Task<ResponeModel> AddPlacementTest(AddPlacementTestModel model);
        Task<ResponeModel> UpdatePlacementTest(UpdatePlacementTestModel model);
        Task<ResponeModel> DeletePlacementTest(int placementTestId);
        Task<IEnumerable<PlacementTestListModel>> GetAllPlacementTests();

        // Updated: now filter by Category instead of Field
        Task<IEnumerable<object>> GetPlacementTestsByCategory(int categoryId, string accountId);

        Task<PlacementTest?> GetPlacementTestById(int placementTestId);

        // ===== QUESTION =====
        Task<ResponeModel> AddPlacementQuestion(AddPlacementQuestionModel model);
        Task<ResponeModel> UpdatePlacementQuestion(int questionId, AddPlacementQuestionModel model);
        Task<ResponeModel> DeletePlacementQuestion(int questionId);
        Task<IEnumerable<PlacementQuestion>> GetQuestionsByTestId(int placementTestId);

        // ===== RESULT =====
        Task<ResponeModel> SavePlacementResult(SavePlacementResultModel model);

        // Updated: now use Category instead of Field
        Task<PlacementResult?> GetLatestResult(string accountId, int categoryId);

        Task<PlacementResultWithCoursesViewModel?> GetLatestResultByAccount(string accountId);
        Task<IEnumerable<PlacementResultViewModel>> GetAllResultsByAccount(string accountId);
        Task<PlacementResultWithCoursesViewModel?> GetLatestResultSuggestions(string accountId);
        Task<PlacementResultWithCoursesViewModel?> GetSuggestionByResult(int resultId);
    }
}