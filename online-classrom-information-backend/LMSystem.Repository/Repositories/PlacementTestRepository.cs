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

        public async Task<ResponeModel> UpdateField(int fieldId, string name, string? description)
        {
            try
            {
                var existingField = await _context.Fields.FindAsync(fieldId);
                if (existingField == null)
                {
                    return new ResponeModel
                    {
                        Status = "Error",
                        Message = "Field not found"
                    };
                }

                // ✅ Cập nhật giá trị mới (nếu có)
                if (!string.IsNullOrWhiteSpace(name))
                    existingField.Name = name;

                if (description != null)
                    existingField.Description = description;

                await _context.SaveChangesAsync();

                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Updated field successfully",
                    DataObject = existingField
                };
            }
            catch (Exception ex)
            {
                return new ResponeModel
                {
                    Status = "Error",
                    Message = $"Update failed: {ex.Message}"
                };
            }
        }


        public async Task<IEnumerable<object>> GetAllFields()
        {
            return await _context.Fields
                .Select(f => new
                {
                    f.FieldId,
                    f.Name,
                    f.Description,
                    PlacementTests = f.PlacementTests.Select(t => new
                    {
                        t.PlacementTestId,
                        t.Title,
                        t.Description,
                        PlacementQuestions = t.PlacementQuestions.Select(q => new
                        {
                            q.QuestionId,
                            q.QuestionText,
                            q.CorrectAnswer,
                            q.DifficultyLevel
                        }).ToList()
                    }).ToList()
                })
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
                if (model.FieldId.HasValue)
                    existingTest.FieldId = model.FieldId.Value;

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

        public async Task<IEnumerable<object>> GetPlacementTestsByField(int fieldId, string accountId)
        {
            return await _context.PlacementTests
                .Where(t => t.FieldId == fieldId && t.IsActive == true)
                .Select(t => new
                {
                    t.PlacementTestId,
                    t.Title,
                    t.Description,
                    t.IsActive,
                    t.CreatedAt,
                    QuestionCount = t.PlacementQuestions.Count,

                    // ✅ Lấy kết quả gần nhất của người dùng này
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
                    FieldId = r.PlacementTest.Field.FieldId,
                    FieldName = r.PlacementTest.Field.Name
                })
                .FirstOrDefaultAsync();

            if (latestResult == null)
                return null;

            // 2️⃣ Ánh xạ Level → số thứ tự để so sánh
            int levelValue = int.TryParse(latestResult.Level, out var val) ? val : 0;


            // 3️⃣ Lấy danh sách khóa học theo Field và Level <= levelValue
            var courses = await _context.Courses
                .Where(c => c.IsPublic == true && c.CourseIsActive == true)
                .Include(c => c.CourseCategories)
                    .ThenInclude(cc => cc.Category)
                        .ThenInclude(cat => cat.FieldCategories)
                .Include(c => c.Account)
                .ToListAsync();

            var filteredCourses = courses
                .Where(c =>
                {
                    // Lấy fieldId qua Category
                    var fieldIds = c.CourseCategories
                        .SelectMany(cc => cc.Category.FieldCategories)
                        .Select(fc => fc.FieldId)
                        .Distinct()
                        .ToList();

                    // Kiểm tra field trùng
                    bool sameField = fieldIds.Contains(latestResult.FieldId);

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

                    return sameField || sameOrLowerLevel;
                })
                .Select(course =>
                {
                    // Ánh xạ CourseLevel (1,2,3 → Fresher, Junior, Master)
                    string courseLevelDisplay = "";
                    if (!string.IsNullOrEmpty(course.CourseLevel))
                    {
                        var levels = course.CourseLevel.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(l => l.Trim())
                            .Select(l =>
                            {
                                return l switch
                                {
                                    "1" => "Fresher",
                                    "2" => "Junior",
                                    "3" => "Master",
                                    _ => "Unknown"
                                };
                            });
                        courseLevelDisplay = string.Join(", ", levels);
                    }

                    return new CourseShortViewModel
                    {
                        CourseId = course.CourseId
                    };
                })
                .ToList();

            // 4️⃣ Trả về kết quả cuối cùng
            return new PlacementResultWithCoursesViewModel
            {
                ResultId = latestResult.ResultId,
                FieldId = latestResult.FieldId,
                FieldName = latestResult.FieldName,
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
                .ThenInclude(t => t.Field)
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
                    FieldId = r.PlacementTest.Field.FieldId,
                    FieldName = r.PlacementTest.Field.Name
                })
                .ToListAsync();
        }


    }
    public class PlacementResultWithCoursesViewModel
    {
        public int ResultId { get; set; }
        public int FieldId { get; set; }
        public string FieldName { get; set; } = null!;
        public string? Level { get; set; }
        public double Score { get; set; }
        public DateTime CompletedAt { get; set; }
        public List<CourseShortViewModel> RecommendedCourses { get; set; } = new();
    }

    public class CourseShortViewModel
    {
        public int CourseId { get; set; }

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

        // Field
        public int FieldId { get; set; }
        public string FieldName { get; set; } = null!;
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
        public int? FieldId { get; set; }
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

    public class UpdateFieldRequest
    {
        public int FieldId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }

}
