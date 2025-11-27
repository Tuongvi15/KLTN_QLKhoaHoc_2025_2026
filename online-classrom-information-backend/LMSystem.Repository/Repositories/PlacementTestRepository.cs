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

        // NOTE: This updated repository replaces usages of Field with Category.
        // Make sure you also update the PlacementTest model (replace FieldId/Field with CategoryId/Category)
        // and generate a migration after applying these changes.

        // ===================== PLACEMENT TEST =====================
        public async Task<ResponeModel> AddPlacementTest(AddPlacementTestModel model)
        {
            try
            {
                var test = new PlacementTest
                {
                    CategoryId = model.CategoryId,
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
                if (model.CategoryId.HasValue)
                    existingTest.CategoryId = model.CategoryId.Value;

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

            // Remove dependent questions (and answers if FK is configured with NoAction)
            _context.PlacementQuestions.RemoveRange(test.PlacementQuestions ?? Enumerable.Empty<PlacementQuestion>());
            _context.PlacementTests.Remove(test);
            await _context.SaveChangesAsync();

            return new ResponeModel { Status = "Success", Message = "Deleted placement test successfully" };
        }

        public async Task<IEnumerable<PlacementTestListModel>> GetAllPlacementTests()
        {
            return await _context.PlacementTests
                .Include(t => t.Category)
                .Include(t => t.PlacementQuestions)
                .Select(t => new PlacementTestListModel
                {
                    PlacementTestId = t.PlacementTestId,
                    CategoryName = t.Category.Name,
                    CategoryId = t.CategoryId,
                    Title = t.Title,
                    Description = t.Description,
                    IsActive = t.IsActive,
                    QuestionCount = t.PlacementQuestions.Count,
                    CreatedAt = t.CreatedAt
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetPlacementTestsByCategory(int categoryId, string accountId)
        {
            return await _context.PlacementTests
                .Where(t => t.CategoryId == categoryId && t.IsActive == true)
                .Select(t => new
                {
                    t.PlacementTestId,
                    t.Title,
                    t.Description,
                    t.IsActive,
                    t.CreatedAt,
                    QuestionCount = t.PlacementQuestions.Count,

                    LatestResult = t.PlacementResults
                        .Where(r => r.AccountId == accountId)
                        .OrderByDescending(r => r.CompletedAt)
                        .Select(r => new
                        {
                            r.Score,
                            r.Level,
                            r.CompletedAt
                        })
                        .FirstOrDefault()
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }


        public async Task<PlacementTest?> GetPlacementTestById(int placementTestId)
        {
            return await _context.PlacementTests
                .Include(t => t.Category)
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

        public async Task<PlacementResult?> GetLatestResult(string accountId, int categoryId)
        {
            return await _context.PlacementResults
                .Include(r => r.PlacementTest)
                .Where(r => r.AccountId == accountId && r.PlacementTest.CategoryId == categoryId)
                .OrderByDescending(r => r.CompletedAt)
                .FirstOrDefaultAsync();
        }
        public async Task<PlacementResultWithCoursesViewModel?> GetLatestResultSuggestions(string accountId)
        {
            // 1️⃣ Lấy kết quả gần nhất của user
            var latest = await _context.PlacementResults
                .Include(r => r.PlacementTest)
                .ThenInclude(t => t.Category)
                .Where(r => r.AccountId == accountId)
                .OrderByDescending(r => r.CompletedAt)
                .FirstOrDefaultAsync();

            if (latest == null)
                return null;

            int userLevel = 0;
            int.TryParse(latest.Level, out userLevel);

            int categoryId = latest.PlacementTest.Category.CatgoryId;

            // 2️⃣ Tìm khóa học theo cùng Category và cùng Level
            var courses = await _context.Courses
                .Where(c => c.IsPublic == true && c.CourseIsActive == true)
                .Include(c => c.CourseCategories)
                .ToListAsync();

            var filtered = courses
                .Where(c =>
                {
                    bool sameCategory = c.CourseCategories.Any(cc => cc.CategoryId == categoryId);

                    int minCourseLevel = 0;
                    if (!string.IsNullOrEmpty(c.CourseLevel))
                    {
                        var levels = c.CourseLevel
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(x => x.Trim())
                            .Select(x => int.TryParse(x, out int lv) ? lv : 0);

                        minCourseLevel = levels.Min();
                    }

                    return sameCategory && minCourseLevel == userLevel;
                })
                .Take(5)
                .Select(course => new CourseShortViewModel
                {
                    CourseId = course.CourseId,
                    Title = course.Title,
                    ImageUrl = course.ImageUrl,
                    Description = course.Description,
                    CourseLevel = course.CourseLevel
                }).ToList();

            return new PlacementResultWithCoursesViewModel
            {
                ResultId = latest.ResultId,
                CategoryId = categoryId,
                CategoryName = latest.PlacementTest.Category.Name,
                Level = latest.Level,
                Score = latest.Score,
                CompletedAt = latest.CompletedAt,
                RecommendedCourses = filtered
            };
        }

        public async Task<PlacementResultWithCoursesViewModel?> GetSuggestionByResult(int resultId)
        {
            var result = await _context.PlacementResults
                .Where(r => r.ResultId == resultId)
                .Select(r => new
                {
                    r.ResultId,
                    r.Score,
                    r.Level,
                    r.CompletedAt,
                    PlacementTestId = r.PlacementTest.PlacementTestId,
                    Title = r.PlacementTest.Title,
                    Description = r.PlacementTest.Description,
                    CategoryId = r.PlacementTest.Category.CatgoryId,
                    CategoryName = r.PlacementTest.Category.Name
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return null;

            int levelValue = int.TryParse(result.Level, out var val) ? val : 0;

            var courses = await _context.Courses
                .Where(c => c.IsPublic == true && c.CourseIsActive == true)
                .Include(c => c.CourseCategories)
                .ToListAsync();

            var filtered = courses
                .Where(c =>
                    c.CourseCategories.Any(cc => cc.CategoryId == result.CategoryId)
                )
                .Select(c => new CourseShortViewModel
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    ImageUrl = c.ImageUrl,
                    Description = c.Description
                })
                .ToList();

            return new PlacementResultWithCoursesViewModel
            {
                ResultId = result.ResultId,
                CategoryId = result.CategoryId,
                CategoryName = result.CategoryName,
                Level = result.Level,
                Score = result.Score,
                CompletedAt = result.CompletedAt,
                RecommendedCourses = filtered
            };
        }


        public async Task<PlacementResultWithCoursesViewModel?> GetLatestResultByAccount(string accountId)
        {
            // 1️⃣ Lấy kết quả gần nhất
            var latestResult = await _context.PlacementResults
                .Where(r => r.AccountId == accountId)
                .OrderByDescending(r => r.CompletedAt)
                .Select(r => new
                {
                    r.ResultId,
                    r.Score,
                    r.Level,
                    r.CompletedAt,
                    PlacementTestId = r.PlacementTest.PlacementTestId,
                    Title = r.PlacementTest.Title,
                    Description = r.PlacementTest.Description,
                    CategoryId = r.PlacementTest.Category.CatgoryId,
                    CategoryName = r.PlacementTest.Category.Name
                })
                .FirstOrDefaultAsync();

            if (latestResult == null)
                return null;

            // 2️⃣ Ánh xạ Level → số thứ tự để so sánh
            int levelValue = int.TryParse(latestResult.Level, out var val) ? val : 0;

            // 3️⃣ Lấy danh sách khóa học theo Category và Level <= levelValue
            var courses = await _context.Courses
                .Where(c => c.IsPublic == true && c.CourseIsActive == true)
                .Include(c => c.CourseCategories)
                    .ThenInclude(cc => cc.Category)
                .Include(c => c.Account)
                .ToListAsync();

            var filteredCourses = courses
                .Where(c =>
                {
                    // Kiểm tra category trùng
                    bool sameCategory = c.CourseCategories.Any(cc => cc.CategoryId == latestResult.CategoryId);

                    // Kiểm tra cấp độ khóa học <= cấp độ user
                    int courseLevelNumeric = 0;
                    if (!string.IsNullOrEmpty(c.CourseLevel))
                    {
                        var levelNums = c.CourseLevel.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(x => x.Trim())
                            .Select(x => int.TryParse(x, out int n) ? n : 0);
                        courseLevelNumeric = levelNums.Min(); // lấy cấp nhỏ nhất (vd "2,3" => 2)
                    }

                    bool sameOrLowerLevel = courseLevelNumeric <= levelValue || levelValue == 0;

                    return sameCategory || sameOrLowerLevel;
                })
                .Select(course => new CourseShortViewModel
                {
                    CourseId = course.CourseId
                })
                .ToList();

            // 4️⃣ Trả về kết quả cuối cùng
            return new PlacementResultWithCoursesViewModel
            {
                ResultId = latestResult.ResultId,
                CategoryId = latestResult.CategoryId,
                CategoryName = latestResult.CategoryName,
                Level = latestResult.Level,
                Score = latestResult.Score,
                CompletedAt = latestResult.CompletedAt,
                RecommendedCourses = filteredCourses
            };
        }

        public async Task<IEnumerable<PlacementResultViewModel>> GetAllResultsByAccount(string accountId)
        {
            return await _context.PlacementResults
                .Include(r => r.PlacementTest)
                .ThenInclude(t => t.Category)
                .Where(r => r.AccountId == accountId)
                .OrderByDescending(r => r.CompletedAt)
                .Select(r => new PlacementResultViewModel
                {
                    ResultId = r.ResultId,
                    Score = r.Score,
                    Level = r.Level,
                    CompletedAt = r.CompletedAt,
                    PlacementTestId = r.PlacementTestId,
                    Title = r.PlacementTest.Title,
                    Description = r.PlacementTest.Description,
                    CategoryId = r.PlacementTest.Category.CatgoryId,
                    CategoryName = r.PlacementTest.Category.Name
                })
                .ToListAsync();
        }


    }

    public class PlacementResultWithCoursesViewModel
    {
        public int ResultId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string? Level { get; set; }
        public double Score { get; set; }
        public DateTime CompletedAt { get; set; }
        public List<CourseShortViewModel> RecommendedCourses { get; set; } = new();
    }

    public class CourseShortViewModel
    {
        public int CourseId { get; set; }
        public string? Title { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string? CourseLevel { get; set; }
    }


    public class PlacementResultWithCourseIdsViewModel
    {
        public List<int> CourseIds { get; set; } = new();
    }


    public class PlacementResultViewModel
    {
        public int ResultId { get; set; }
        public double Score { get; set; }
        public string? Level { get; set; }
        public DateTime CompletedAt { get; set; }

        // PlacementTest
        public int PlacementTestId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }

        // Category
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
    }


    public class AddPlacementTestModel
    {
        public int CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
    }

    public class UpdatePlacementTestModel
    {
        public int PlacementTestId { get; set; }
        public int? CategoryId { get; set; }
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
        public string CategoryName { get; set; } = null!;
        public int CategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int QuestionCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
