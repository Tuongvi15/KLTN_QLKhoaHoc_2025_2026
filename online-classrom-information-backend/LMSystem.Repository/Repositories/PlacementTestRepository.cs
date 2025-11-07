using LMSystem.Repository.Data;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Repositories
{
    public class PlacementTestRepository : IPlacementTestRepository
    {
        private readonly LMOnlineSystemDbContext _context;

        public PlacementTestRepository(LMOnlineSystemDbContext context)
        {
            _context = context;
        }

        // ===================== FIELD =====================
        public async Task<ResponeModel> AddField(string name, string? description)
        {
            try
            {
                var field = new Field { Name = name, Description = description };
                _context.Fields.Add(field);
                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Added field successfully", DataObject = field };
            }
            catch (Exception ex)
            {
                return new ResponeModel { Status = "Error", Message = ex.Message };
            }
        }

        public async Task<IEnumerable<Field>> GetAllFields()
        {
            return await _context.Fields
                .Include(f => f.PlacementTests)
                .ToListAsync();
        }

        public async Task<ResponeModel> DeleteField(int fieldId)
        {
            var field = await _context.Fields.FindAsync(fieldId);
            if (field == null)
                return new ResponeModel { Status = "Error", Message = "Field not found" };

            _context.Fields.Remove(field);
            await _context.SaveChangesAsync();
            return new ResponeModel { Status = "Success", Message = "Deleted field successfully" };
        }

        // ===================== PLACEMENT TEST =====================
        public async Task<ResponeModel> AddPlacementTest(AddPlacementTestModel model)
        {
            try
            {
                var test = new PlacementTest
                {
                    FieldId = model.FieldId,
                    Title = model.Title,
                    Description = model.Description,
                    IsActive = false,
                };

                _context.PlacementTests.Add(test);
                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Added placement test successfully", DataObject = test };
            }
            catch (Exception ex)
            {
                return new ResponeModel { Status = "Error", Message = ex.Message };
            }
        }

        public async Task<ResponeModel> UpdatePlacementTest(UpdatePlacementTestModel model)
        {
            try
            {
                var existingTest = await _context.PlacementTests.FindAsync(model.PlacementTestId);
                if (existingTest == null)
                    return new ResponeModel { Status = "Error", Message = "Placement test not found" };

                if (!string.IsNullOrEmpty(model.Title))
                    existingTest.Title = model.Title;
                if (!string.IsNullOrEmpty(model.Description))
                    existingTest.Description = model.Description;
                if (model.IsActive.HasValue)
                    existingTest.IsActive = model.IsActive.Value;

                await _context.SaveChangesAsync();
                return new ResponeModel { Status = "Success", Message = "Updated placement test successfully", DataObject = existingTest };
            }
            catch (Exception ex)
            {
                return new ResponeModel { Status = "Error", Message = ex.Message };
            }
        }

        public async Task<ResponeModel> DeletePlacementTest(int placementTestId)
        {
            var test = await _context.PlacementTests
                .Include(t => t.PlacementQuestions)
                .FirstOrDefaultAsync(t => t.PlacementTestId == placementTestId);

            if (test == null)
                return new ResponeModel { Status = "Error", Message = "Placement test not found" };

            _context.PlacementQuestions.RemoveRange(test.PlacementQuestions);
            _context.PlacementTests.Remove(test);
            await _context.SaveChangesAsync();

            return new ResponeModel { Status = "Success", Message = "Deleted placement test successfully" };
        }

        public async Task<IEnumerable<PlacementTestListModel>> GetAllPlacementTests()
        {
            return await _context.PlacementTests
                .Include(t => t.Field)
                .Include(t => t.PlacementQuestions)
                .Select(t => new PlacementTestListModel
                {
                    PlacementTestId = t.PlacementTestId,
                    FieldName = t.Field.Name,
                    FieldId = t.FieldId,
                    Title = t.Title,
                    Description = t.Description,
                    IsActive = t.IsActive,
                    QuestionCount = t.PlacementQuestions.Count,
                    CreatedAt = t.CreatedAt
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PlacementTest>> GetPlacementTestsByField(int fieldId)
        {
            return await _context.PlacementTests
                .Include(t => t.PlacementQuestions)
                .Where(t => t.FieldId == fieldId)
                .ToListAsync();
        }

        public async Task<PlacementTest?> GetPlacementTestById(int placementTestId)
        {
            return await _context.PlacementTests
                .Include(t => t.Field)
                .Include(t => t.PlacementQuestions)
                .FirstOrDefaultAsync(t => t.PlacementTestId == placementTestId);
        }

        // ===================== QUESTIONS =====================
        public async Task<ResponeModel> AddPlacementQuestion(AddPlacementQuestionModel model)
        {
            try
            {
                var question = new PlacementQuestion
                {
                    PlacementTestId = model.PlacementTestId,
                    QuestionText = model.QuestionText,
                    AnswerOptions = model.AnswerOptions,
                    CorrectAnswer = model.CorrectAnswer,
                    DifficultyLevel = model.DifficultyLevel,
                    ImageUrl = model.ImageUrl
                };

                _context.PlacementQuestions.Add(question);
                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Added question successfully", DataObject = question };
            }
            catch (Exception ex)
            {
                return new ResponeModel { Status = "Error", Message = ex.Message };
            }
        }

        public async Task<ResponeModel> UpdatePlacementQuestion(int questionId, AddPlacementQuestionModel model)
        {
            try
            {
                var existingQuestion = await _context.PlacementQuestions.FindAsync(questionId);
                if (existingQuestion == null)
                    return new ResponeModel { Status = "Error", Message = "Question not found" };

                existingQuestion.QuestionText = model.QuestionText ?? existingQuestion.QuestionText;
                existingQuestion.AnswerOptions = model.AnswerOptions ?? existingQuestion.AnswerOptions;
                existingQuestion.CorrectAnswer = model.CorrectAnswer ?? existingQuestion.CorrectAnswer;
                existingQuestion.DifficultyLevel = model.DifficultyLevel != 0 ? model.DifficultyLevel : existingQuestion.DifficultyLevel;
                existingQuestion.ImageUrl = model.ImageUrl ?? existingQuestion.ImageUrl;

                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Updated question successfully", DataObject = existingQuestion };
            }
            catch (Exception ex)
            {
                return new ResponeModel { Status = "Error", Message = ex.Message };
            }
        }

        public async Task<IEnumerable<PlacementQuestion>> GetQuestionsByTestId(int placementTestId)
        {
            return await _context.PlacementQuestions
                .Where(q => q.PlacementTestId == placementTestId)
                .ToListAsync();
        }

        public async Task<ResponeModel> DeletePlacementQuestion(int questionId)
        {
            var question = await _context.PlacementQuestions.FindAsync(questionId);
            if (question == null)
                return new ResponeModel { Status = "Error", Message = "Question not found" };

            _context.PlacementQuestions.Remove(question);
            await _context.SaveChangesAsync();

            return new ResponeModel { Status = "Success", Message = "Deleted question successfully" };
        }

        // ===================== RESULT =====================
        public async Task<ResponeModel> SavePlacementResult(SavePlacementResultModel model)
        {
            try
            {
                var result = new PlacementResult
                {
                    AccountId = model.AccountId,
                    PlacementTestId = model.PlacementTestId,
                    Score = model.Score,
                    Level = model.Level,
                    CompletedAt = DateTime.UtcNow
                };

                _context.PlacementResults.Add(result);
                await _context.SaveChangesAsync();

                if (model.Answers != null && model.Answers.Count > 0)
                {
                    foreach (var ans in model.Answers)
                    {
                        _context.PlacementAnswers.Add(new PlacementAnswer
                        {
                            ResultId = result.ResultId,
                            QuestionId = ans.QuestionId,
                            SelectedAnswer = ans.SelectedAnswer,
                            IsCorrect = ans.IsCorrect
                        });
                    }
                    await _context.SaveChangesAsync();
                }

                return new ResponeModel { Status = "Success", Message = "Saved placement result successfully", DataObject = result };
            }
            catch (Exception ex)
            {
                return new ResponeModel { Status = "Error", Message = ex.Message };
            }
        }

        public async Task<PlacementResult?> GetLatestResult(string accountId, int fieldId)
        {
            return await _context.PlacementResults
                .Include(r => r.PlacementTest)
                .Where(r => r.AccountId == accountId && r.PlacementTest.FieldId == fieldId)
                .OrderByDescending(r => r.CompletedAt)
                .FirstOrDefaultAsync();
        }
    }

    public class AddPlacementTestModel
    {
        public int FieldId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class UpdatePlacementTestModel
    {
        public int PlacementTestId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AddPlacementQuestionModel
    {
        public int PlacementTestId { get; set; }
        public string QuestionText { get; set; } = null!;
        public string AnswerOptions { get; set; } = null!;
        public string CorrectAnswer { get; set; } = null!;
        public byte DifficultyLevel { get; set; }
        public string? ImageUrl { get; set; } // hình minh họa
    }

    public class SavePlacementResultModel
    {
        public string AccountId { get; set; }
        public int PlacementTestId { get; set; }
        public double Score { get; set; }
        public string Level { get; set; } = null!;
        public List<SavePlacementAnswerModel>? Answers { get; set; }
    }

    public class SavePlacementAnswerModel
    {
        public int QuestionId { get; set; }
        public string SelectedAnswer { get; set; } = null!;
        public bool IsCorrect { get; set; }
    }

    public class PlacementTestListModel
    {
        public int PlacementTestId { get; set; }
        public string FieldName { get; set; } = null!;
        public int FieldId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int QuestionCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AddFieldModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
