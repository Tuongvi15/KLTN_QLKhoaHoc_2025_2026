using LMSystem.Repository.Data;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface IPlacementTestRepository
    {
        // ===== FIELD =====
        Task<ResponeModel> AddField(string name, string? description);
        Task<IEnumerable<Field>> GetAllFields();
        Task<ResponeModel> DeleteField(int fieldId);
        Task<ResponeModel> UpdateField(int fieldId, string name, string? description);

        // ===== PLACEMENT TEST =====
        Task<ResponeModel> AddPlacementTest(AddPlacementTestModel model);
        Task<ResponeModel> UpdatePlacementTest(UpdatePlacementTestModel model);
        Task<ResponeModel> DeletePlacementTest(int placementTestId);
        Task<IEnumerable<PlacementTestListModel>> GetAllPlacementTests();
        Task<IEnumerable<PlacementTest>> GetPlacementTestsByField(int fieldId);
        Task<PlacementTest?> GetPlacementTestById(int placementTestId);

        // ===== QUESTION =====
        Task<ResponeModel> AddPlacementQuestion(AddPlacementQuestionModel model);
        Task<ResponeModel> UpdatePlacementQuestion(int questionId, AddPlacementQuestionModel model);
        Task<ResponeModel> DeletePlacementQuestion(int questionId);
        Task<IEnumerable<PlacementQuestion>> GetQuestionsByTestId(int placementTestId);

        // ===== RESULT =====
        Task<ResponeModel> SavePlacementResult(SavePlacementResultModel model);
        Task<PlacementResult?> GetLatestResult(string accountId, int fieldId);
    }
}
