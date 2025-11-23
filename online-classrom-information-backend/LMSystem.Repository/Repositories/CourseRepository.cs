using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Newtonsoft.Json.Serialization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Collections.Specialized.BitVector32;

namespace LMSystem.Repository.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly LMOnlineSystemDbContext _context;
        private readonly INotificationRepository _notificationRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IFirebaseRepository _firebaseRepository;

        public CourseRepository(LMOnlineSystemDbContext context, IFirebaseRepository firebaseRepository, INotificationRepository notificationRepository, IAccountRepository accountRepository)
        {
            _context = context;
            _notificationRepository = notificationRepository;
            _accountRepository = accountRepository;
            _firebaseRepository = firebaseRepository;
        }
        // CourseRepository.cs (thêm method trong class)
        public async Task<ResponeModel> PublishCourse(int courseId, bool isActive)
        {
            try
            {
                var existingCourse = await _context.Courses
                    .Include(c => c.CourseCategories)
                    .FirstOrDefaultAsync(c => c.CourseId == courseId);

                if (existingCourse == null)
                {
                    return new ResponeModel { Status = "Error", Message = "Course not found" };
                }

                existingCourse.CourseIsActive = isActive;

                // Nếu muốn khi active = true đồng thời public thì uncomment:
                // if (isActive) existingCourse.IsPublic = true;

                existingCourse.UpdateAt = DateTime.UtcNow;
                //if (isActive)
                //{
                //    existingCourse.PublicAt = DateTime.UtcNow;
                //}

                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Course status updated", DataObject = existingCourse };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PublishCourse Exception: {ex.Message}");
                return new ResponeModel { Status = "Error", Message = "An error occurred while updating course status" };
            }
        }

        public async Task CreateApproveCourse(ApproveCourse approve)
        {
            _context.ApproveCourses.Add(approve);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateApproveCourse(ApproveCourse approve)
        {
            _context.ApproveCourses.Update(approve);
            await _context.SaveChangesAsync();
        }

        public async Task SetCoursePublic(int courseId)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
            if (course == null) return;

            course.IsPublic = true;
            course.UpdateAt = DateTime.UtcNow;
            course.PublicAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<Course?> GetCourseByIdAsync(int courseId)
        {
            return await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        }


        public async Task<ApproveCourse?> GetApproveCourseById(int id)
        {
            return await _context.ApproveCourses.FirstOrDefaultAsync(x => x.ApproveCourseId == id);
        }

        public async Task<ResponeModel> AddCourse(AddCourseModel addCourseModel)
        {
            try
            {
                var course = new Course
                {
                    Title = addCourseModel.Title,
                    Description = addCourseModel.Description,
                    ImageUrl = addCourseModel.ImageUrl,
                    VideoPreviewUrl = addCourseModel.VideoPreviewUrl,
                    Price = addCourseModel.Price,
                    SalesCampaign = addCourseModel.SalesCampaign,
                    IsPublic = addCourseModel.IsPublic,
                    CreateAt = DateTime.UtcNow,
                    PublicAt = DateTime.UtcNow,
                    TotalDuration = addCourseModel.TotalDuration,
                    AccountId = addCourseModel.AccountId,
                    CourseIsActive = addCourseModel.CourseIsActive,
                    KnowdledgeDescription = addCourseModel.KnowdledgeDescription,
                    LinkCertificated = addCourseModel.LinkCertificated,
                    CourseLevel = addCourseModel.CourseLevel
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                foreach (var categoryId in addCourseModel.CategoryList)
                {
                    var courseCategory = new CourseCategory
                    {
                        CourseId = course.CourseId,
                        CategoryId = categoryId
                    };

                    _context.CourseCategories.Add(courseCategory);
                }
                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Added course successfully", DataObject = course };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel { Status = "Error", Message = "An error occurred while adding the course" };
            }
        }

        public async Task<List<CourseReportDto>> GetCoursesReport(string? teacherId, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.Courses
                .Include(c => c.Account)
                .Include(c => c.CourseCategories).ThenInclude(cc => cc.Category)
                .Include(c => c.RegistrationCourses)
                .AsQueryable();

            if (!string.IsNullOrEmpty(teacherId))
                query = query.Where(c => c.AccountId == teacherId);

            if (fromDate.HasValue)
            {
                var fromUtc = DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Utc);
                query = query.Where(c => c.CreateAt >= fromUtc);
            }

            if (toDate.HasValue)
            {
                var toUtc = DateTime.SpecifyKind(toDate.Value, DateTimeKind.Utc);
                query = query.Where(c => c.CreateAt <= toUtc);
            }


            return await query.Select(c => new CourseReportDto
            {
                CourseId = c.CourseId,
                Title = c.Title,
                TeacherName = c.Account.FirstName + " " + c.Account.LastName,
                Categories = string.Join(", ", c.CourseCategories.Select(cc => cc.Category.Name)),
                Price = c.Price ?? 0,
                StudentCount = c.RegistrationCourses.Count(),
                Duration = c.TotalDuration,
                IsPublic = c.IsPublic ?? false,
                IsActive = c.CourseIsActive ?? false,
                Created = c.CreateAt,
                Updated = c.UpdateAt
            }).ToListAsync();
        }

        public async Task<List<ApproveCourse>> GetApproveHistory(int courseId)
        {
            return await _context.ApproveCourses
                .Where(x => x.CourseId == courseId)
                .OrderByDescending(x => x.ApproveAt)  // sort tại DB cho tối ưu
                .ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetAllCourses()
        {
            return await _context.Courses.ToListAsync();
        }

        public async Task<Course> GetCourseDetailByIdAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Steps)
                .Include(c => c.CourseCategories)
                    .ThenInclude(cc => cc.Category)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
                return null;

            // ✅ Sắp xếp lại thứ tự sau khi load dữ liệu (EF không order trong Include)
            course.Sections = course.Sections
                .OrderBy(s => s.Position)
                .Select(s =>
                {
                    s.Steps = s.Steps.OrderBy(st => st.Position).ToList();
                    return s;
                })
                .ToList();

            return course;
        }

        public async Task<IEnumerable<Course>> GetCoursesByTeacherIdAsync(string teacherId)
        {
            return await _context.Courses
                .Where(c => c.AccountId == teacherId)
                .Include(c => c.CourseCategories)
                    .ThenInclude(cc => cc.Category)
                .Include(c => c.RegistrationCourses)
                .ToListAsync();
        }


        public async Task<IEnumerable<object>> GetStudentsInCourseAsync(int courseId, string teacherId)
        {
            var course = await _context.Courses
                .Include(c => c.RegistrationCourses)
                .ThenInclude(r => r.Account)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.AccountId == teacherId);

            if (course == null)
                return null!;

            return course.RegistrationCourses.Select(r => new
            {
                r.AccountId,
                r.Account.FirstName,
                r.Account.LastName,
                r.Account.Email,
                r.EnrollmentDate
            });
        }
        public async Task<IEnumerable<object>> GetStudentsInCoursesAsync(List<int> courseIds, string teacherId)
        {
            if (courseIds == null || !courseIds.Any())
                return Enumerable.Empty<object>();

            var courses = await _context.Courses
                .Include(c => c.RegistrationCourses)
                    .ThenInclude(r => r.Account)
                .Where(c => courseIds.Contains(c.CourseId) && c.AccountId == teacherId)
                .ToListAsync();

            if (!courses.Any())
                return Enumerable.Empty<object>();

            // Gom toàn bộ học viên từ tất cả khóa học
            var students = courses
                .SelectMany(c => c.RegistrationCourses.Select(r => new
                {
                    r.AccountId,
                    r.Account.FirstName,
                    r.Account.LastName,
                    r.Account.Email,
                    r.EnrollmentDate,
                    CourseId = c.CourseId,
                    CourseTitle = c.Title
                }))
                .ToList();

            return students;
        }


        public async Task<CourseListModel> GetCourseDetailByCourseIdAsync(int courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Sections.OrderBy(section => section.Position))
                .ThenInclude(s => s.Steps.OrderBy(step => step.Position))
                .Include(c => c.CourseCategories)
                .ThenInclude(cc => cc.Category)
                .Include(c => c.Account)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            return new CourseListModel
            {
                CourseId = course.CourseId,
                ImageUrl = course.ImageUrl,
                Title = course.Title,
                Price = course.Price,
                TotalDuration = course.TotalDuration,
                UpdateAt = course.UpdateAt,
                AccountId = course.AccountId,
                AccountName = course.Account.FirstName + course.Account.LastName,
                CourseIsActive = course.CourseIsActive,
                CourseCategory = string.Join(", ", course.CourseCategories.Select(cc => cc.Category.Name))
            };
        }

        public async Task<(IEnumerable<CourseListModel> Courses, int CurrentPage, int PageSize, int TotalCourses, int TotalPages)>
    GetCoursesWithFilters(CourseFilterParameters filterParams)
        {
            // Gán giá trị mặc định để tránh lỗi null hoặc chia 0
            int pageNumber = filterParams.PageNumber > 0 ? filterParams.PageNumber : 1;
            int pageSize = filterParams.PageSize > 0 ? filterParams.PageSize : 10;

            var query = _context.Courses
                .AsNoTracking()
                .Include(c => c.Account)
                .Include(c => c.CourseCategories)
                    .ThenInclude(cc => cc.Category)
                .AsQueryable();

            // 🔍 Filter theo category
            if (filterParams.CategoryIds is { Count: > 0 })
            {
                query = query.Where(c =>
                    c.CourseCategories.Any(cc => filterParams.CategoryIds.Contains(cc.CategoryId)));
            }

            // 💰 Filter theo giá
            if (filterParams.MinPrice is not null)
            {
                query = query.Where(c => c.Price >= filterParams.MinPrice.Value);
            }

            if (filterParams.IsActive is not null)
            {
                query = query.Where(c => c.CourseIsActive == filterParams.IsActive);
            }

            if (filterParams.MaxPrice is not null)
            {
                query = query.Where(c => c.Price <= filterParams.MaxPrice.Value);
            }

            // 🔎 Tìm kiếm theo title (case-insensitive)
            if (!string.IsNullOrWhiteSpace(filterParams.Search))
            {
                string search = filterParams.Search.Trim().ToLower();
                query = query.Where(c => c.Title.ToLower().Contains(search) || (c.Account.FirstName + " " + c.Account.LastName).ToLower().Contains(search));
            }

            // 👤 Filter theo AccountId
            if (!string.IsNullOrWhiteSpace(filterParams.AccountId))
            {
                query = query.Where(c => c.AccountId == filterParams.AccountId);
            }

            // ⚙️ Sắp xếp
            query = filterParams.Sort switch
            {
                "title_asc" => query.OrderBy(c => c.Title),
                "title_desc" => query.OrderByDescending(c => c.Title),
                "price_asc" => query.OrderBy(c => c.Price),
                "price_desc" => query.OrderByDescending(c => c.Price),
                _ => query.OrderByDescending(c => c.UpdateAt) // Mặc định sort theo thời gian cập nhật mới nhất
            };

            // 📊 Tính toán phân trang
            int totalCourses = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalCourses / (double)pageSize);

            // 📦 Lấy danh sách khóa học (Select có thêm Field)
            var courses = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new CourseListModel
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    ImageUrl = c.ImageUrl,
                    Price = c.Price,
                    CourseCategory = string.Join(", ", c.CourseCategories.Select(cc => cc.Category.Name)),
                    TotalDuration = c.TotalDuration,
                    UpdateAt = c.UpdateAt,
                    IsPublic = c.IsPublic,
                    CourseIsActive = c.CourseIsActive,
                    SalesCampaign = c.SalesCampaign,
                    AccountId = c.AccountId,
                    AccountName = c.Account.FirstName + " " + c.Account.LastName
                })
                .ToListAsync();

            // ✅ Trả kết quả
            return (
                Courses: courses,
                CurrentPage: pageNumber,
                PageSize: pageSize,
                TotalCourses: totalCourses,
                TotalPages: totalPages
            );
        }

        public async Task<bool> CheckStudentStillLearning(int courseId)
        {
            return await _context.RegistrationCourses
                .AnyAsync(rc =>
                    rc.CourseId == courseId &&
                    (rc.IsCompleted == false || rc.LearningProgress < 1)
                );
        }




        //public async Task<PagedList<CourseListModel>> GetAllCourse(PaginationParameter paginationParameter)
        //{
        //    if (_context == null)
        //    {
        //        return null;
        //    }

        //    var courseQuery = _context.Courses.AsQueryable();

        //    if (!string.IsNullOrEmpty(paginationParameter.Search))
        //    {
        //        courseQuery = courseQuery.Where(o => o.Title.Contains(paginationParameter.Search));
        //    }

        //    switch (paginationParameter.Sort)
        //    {
        //        case "title_asc":
        //            courseQuery = courseQuery.OrderBy(p => p.Title);
        //            break;
        //        case "title_desc":
        //            courseQuery = courseQuery.OrderByDescending(p => p.Title);
        //            break;
        //        case "price_asc":
        //            courseQuery = courseQuery.OrderBy(p => p.Price);
        //            break;
        //        case "price_desc":
        //            courseQuery = courseQuery.OrderByDescending(p => p.Price);
        //            break;
        //    }

        //    var totalItems = await courseQuery.CountAsync();

        //    var items = await courseQuery.Skip((paginationParameter.PageNumber - 1) * paginationParameter.PageSize)
        //                     .Take(paginationParameter.PageSize)
        //                     .Select(course => new CourseListModel
        //                     {
        //                         CourseId = course.CourseId,
        //                         Title = course.Title,
        //                         ImageUrl = course.ImageUrl,
        //                         Price = course.Price,
        //                         CourseCategory = string.Join(", ", course.CourseCategories.Select(cc => cc.Category.Name)), 
        //                         TotalDuration = course.TotalDuration,
        //                         UpdateAt = course.UpdateAt,
        //                         CourseIsActive = course.CourseIsActive
        //                     })
        //                     .ToListAsync();


        //    var pagedList = new PagedList<CourseListModel>(items, totalItems, paginationParameter.PageNumber, paginationParameter.PageSize);

        //    return pagedList;
        //}

        public async Task<IEnumerable<Course>> GetTopCoursesByStudentJoined(int numberOfCourses)
        {
            var topCourses = await _context.RegistrationCourses
                .GroupBy(rc => rc.CourseId)
                .OrderByDescending(g => g.Count())
                .Take(numberOfCourses)
                .Select(g => g.Key)
                .ToListAsync();

            var courses = await _context.Courses
                .Where(c => topCourses.Contains(c.CourseId) && c.IsPublic == true && c.CourseIsActive == true)
                .ToListAsync();

            if (courses.Count < numberOfCourses)
            {
                var additionalCourses = await _context.Courses
                    .Where(c => !topCourses.Contains(c.CourseId) && c.IsPublic == true && c.CourseIsActive == true)
                    .OrderBy(c => Guid.NewGuid())
                    .Take(numberOfCourses - courses.Count)
                    .ToListAsync();

                courses.AddRange(additionalCourses);
            }

            return courses;
        }

        public async Task<IEnumerable<Course>> GetTopCoursesBySales(int numberOfCourses)
        {
            var topCourses = await _context.Orders
                .GroupBy(o => o.CourseId)
                .OrderByDescending(g => g.Count())
                .Take(numberOfCourses)
                .Select(g => g.Key)
                .ToListAsync();

            var courses = await _context.Courses
                .Where(c => topCourses.Contains(c.CourseId) && c.IsPublic == true && c.CourseIsActive == true)
                .ToListAsync();

            if (courses.Count < numberOfCourses)
            {
                var additionalCourses = await _context.Courses
                    .Where(c => !topCourses.Contains(c.CourseId) && c.IsPublic == true && c.CourseIsActive == true)
                    .OrderBy(c => Guid.NewGuid())
                    .Take(numberOfCourses - courses.Count)
                    .ToListAsync();

                courses.AddRange(additionalCourses);
            }

            return courses.OrderByDescending(x => x.SalesCampaign);
        }

        public async Task<IEnumerable<Course>> GetTopCoursesByRating(int numberOfCourses)
        {
            var topCourseIds = await _context.RatingCourses
                .Include(rc => rc.Registration)
                .ThenInclude(reg => reg.Course)
                .GroupBy(rc => rc.Registration.CourseId)
                .Select(group => new { CourseId = group.Key, AverageRating = group.Average(rc => rc.RatingStar) })
                .OrderByDescending(x => x.AverageRating)
                .Take(numberOfCourses)
                .Select(x => x.CourseId)
                .ToListAsync();

            var courses = await _context.Courses
                .Where(c => topCourseIds.Contains(c.CourseId) && c.IsPublic == true && c.CourseIsActive == true)
                .ToListAsync();

            if (courses.Count < numberOfCourses)
            {
                var additionalCourses = await _context.Courses
                    .Where(c => !topCourseIds.Contains(c.CourseId) && c.IsPublic == true && c.CourseIsActive == true)
                    .OrderBy(c => Guid.NewGuid())
                    .Take(numberOfCourses - courses.Count)
                    .ToListAsync();

                courses.AddRange(additionalCourses);
            }

            return courses;
        }

        public async Task<ResponeModel> UpdateCourse(UpdateCourseModel updateCourseModel)
        {
            try
            {
                var existingCourse = await _context.Courses
                     .Include(c => c.CourseCategories)
                     .FirstOrDefaultAsync(c => c.CourseId == updateCourseModel.CourseId);
                if (existingCourse == null)
                {
                    return new ResponeModel { Status = "Error", Message = "Course not found" };
                }

                if ((existingCourse.IsPublic.GetValueOrDefault(false) == false) && (updateCourseModel.IsPublic.GetValueOrDefault(false) == true))
                {
                    var listAccountIds = await _accountRepository.GetListAccountIds();

                    foreach (var accountId in listAccountIds)
                    {
                        Notification notification = new Notification
                        {
                            AccountId = accountId,
                            SendDate = DateTime.SpecifyKind(ConvertToLocalTime(DateTime.UtcNow), DateTimeKind.Utc),
                            Type = NotificationType.Course.ToString(),
                            Title = $"Hệ thống đã thêm khóa học mới: {existingCourse.Title}",
                            Message = "Hãy trải nghiệm thêm các khóa học mới để có kiến thức bổ ích!",
                            ModelId = existingCourse.CourseId
                        };
                        await _notificationRepository.AddNotificationByAccountId(notification.AccountId, notification);

                        Notification notificationFirseBase = new Notification
                        {
                            Title = $"Hệ thống đã thêm khóa học mới",
                            Message = $"Hệ thống đã thêm khóa học mới: {existingCourse.Title}",
                        };
                        await _firebaseRepository.PushNotificationFireBase(notificationFirseBase.Title, notificationFirseBase.Message, accountId);
                    }
                }

                existingCourse = submitCourseChange(existingCourse, updateCourseModel);


                //_context.Courses.Update(existingCourse);
                await _context.SaveChangesAsync();

                var response = await _context.Courses
                    .Where(c => c.CourseId == updateCourseModel.CourseId)
                    .Select(c => new
                    {
                        c.CourseId,
                        c.Title,
                        c.Description,
                        c.ImageUrl,
                        c.VideoPreviewUrl,
                        c.Price,
                        c.SalesCampaign,
                        c.IsPublic,
                        c.CreateAt,
                        c.PublicAt,
                        c.UpdateAt,
                        c.TotalDuration,
                        c.CourseIsActive,
                        c.KnowdledgeDescription,
                        c.LinkCertificated,
                        CourseCategories = c.CourseCategories.Select(cc => new
                        {
                            cc.CategoryId,
                            Category = new
                            {
                                cc.Category.Name,
                                cc.Category.Description
                            }
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();


                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Update course successfully",
                    DataObject = response
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel { Status = "Error", Message = "An error occurred while update the course" };
            }
        }


        private DateTime ConvertToLocalTime(DateTime utcDateTime)
        {
            TimeZoneInfo timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, timeZoneInfo);
        }


        private Course submitCourseChange(Course course, UpdateCourseModel updateCourseModel)
        {
            if (!string.IsNullOrEmpty(updateCourseModel.Title))
            {
                course.Title = updateCourseModel.Title;
            }

            if (!string.IsNullOrEmpty(updateCourseModel.Description))
            {
                course.Description = updateCourseModel.Description;
            }

            if (!string.IsNullOrEmpty(updateCourseModel.ImageUrl))
            {
                course.ImageUrl = updateCourseModel.ImageUrl;
            }

            if (!string.IsNullOrEmpty(updateCourseModel.VideoPreviewUrl))
            {
                course.VideoPreviewUrl = updateCourseModel.VideoPreviewUrl;
            }

            if (updateCourseModel.Price.HasValue)
            {
                course.Price = updateCourseModel.Price.Value;
            }

            if (updateCourseModel.SalesCampaign.HasValue)
            {
                course.SalesCampaign = updateCourseModel.SalesCampaign.Value;
            }

            if (updateCourseModel.IsPublic.HasValue)
            {
                course.IsPublic = updateCourseModel.IsPublic.Value;
            }

            if (updateCourseModel.TotalDuration.HasValue)
            {
                course.TotalDuration = updateCourseModel.TotalDuration.Value;
            }

            if (updateCourseModel.CourseIsActive.HasValue)
            {
                course.CourseIsActive = updateCourseModel.CourseIsActive.Value;
            }

            if (!string.IsNullOrEmpty(updateCourseModel.KnowdledgeDescription))
            {
                course.KnowdledgeDescription = updateCourseModel.KnowdledgeDescription;
            }

            if (!string.IsNullOrEmpty(updateCourseModel.LinkCertificated))
            {
                course.LinkCertificated = updateCourseModel.LinkCertificated;
            }
            if (updateCourseModel.SuitableLevels != null && updateCourseModel.SuitableLevels.Any())
            {
                course.CourseLevel = updateCourseModel.SuitableLevels;
            }

            course.UpdateAt = DateTime.UtcNow;

            var categoriesToRemove = course.CourseCategories
                .Where(cc => !updateCourseModel.CategoryList.Contains(cc.CategoryId))
                .ToList();

            foreach (var categoryToRemove in categoriesToRemove)
            {
                course.CourseCategories.Remove(categoryToRemove);
            }

            var categoriesToAdd = updateCourseModel.CategoryList
                .Where(categoryId => !course.CourseCategories.Any(cc => cc.CategoryId == categoryId))
                .Select(categoryId => new CourseCategory { CategoryId = categoryId })
                .ToList();

            foreach (var categoryToAdd in categoriesToAdd)
            {
                course.CourseCategories.Add(categoryToAdd);
            }

            return course;
        }
        public async Task<ResponeModel> GetFullCourseDetail()
        {
            try
            {
                var courses = await _context.Courses
                    .Where(x => x.IsPublic == true && x.CourseIsActive == true)
                    .Include(c => c.Account)
                    .Include(c => c.Sections)
                        .ThenInclude(s => s.Steps)
                    .Include(c => c.CourseCategories)
                        .ThenInclude(cc => cc.Category)
                    .ToListAsync();

                if (courses == null || !courses.Any())
                    return new ResponeModel { Status = "Error", Message = "No courses found" };

                var data = courses.Select(course =>
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

                    return new
                    {
                        course.CourseId,
                        course.Title,
                        course.Description,
                        course.ImageUrl,
                        course.VideoPreviewUrl,
                        course.Price,
                        course.SalesCampaign,
                        course.TotalDuration,
                        CourseLevel = courseLevelDisplay,
                        course.KnowdledgeDescription,
                        Account = new
                        {
                            course.Account?.Id,
                            FullName = course.Account != null ? $"{course.Account.FirstName} {course.Account.LastName}" : "N/A"
                        },
                        Categories = course.CourseCategories.Select(cc => new
                        {
                            cc.CategoryId,
                            cc.Category.Name,
                            cc.Category.Description
                        }),
                    };
                });

                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Retrieved all course details successfully",
                    DataObject = data
                };
            }
            catch (Exception ex)
            {
                return new ResponeModel
                {
                    Status = "Error",
                    Message = "Error while retrieving all course details: " + ex.Message
                };
            }
        }



        public async Task<ResponeModel> DeleteCourse(int courseId)
        {
            try
            {
                var existingCourse = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);

                if (existingCourse == null)
                {
                    return new ResponeModel
                    {
                        Status = "Error",
                        Message = "No course were found for the specified course id"
                    };
                }
                if (existingCourse.CourseIsActive == false)
                {
                    return new ResponeModel
                    {
                        Status = "Error",
                        Message = "Course already inactive"
                    };
                }
                existingCourse.CourseIsActive = false;
                existingCourse.IsPublic = false;

                _context.Entry(existingCourse).State = EntityState.Modified;

                await _context.SaveChangesAsync();

                return new ResponeModel { Status = "Success", Message = "Course deleted successfully", DataObject = existingCourse };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel { Status = "Error", Message = "An error occurred while deleting the course" };
            }
        }

        public async Task<ResponeModel> CountTotalCourse()
        {
            try
            {
                var totalCourses = await _context.Courses.CountAsync();
                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Total courses counted successfully",
                    DataObject = totalCourses
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel { Status = "Error", Message = "An error occurred while counting total courses in the system" };
            }
        }

        public async Task<ResponeModel> CountTotalCourseUpToDate(DateTime to)
        {
            try
            {
                var totalCourses = await _context.Courses
                    .Where(c => c.CreateAt <= to)
                    .CountAsync();
                return new ResponeModel
                {
                    Status = "Success",
                    Message = $"Total courses in the system up to {to} counted successfully",
                    DataObject = totalCourses
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel { Status = "Error", Message = "An error occurred while counting total courses in the system" };
            }
        }

        public async Task<ResponeModel> CountTotalCourseByMonth(int year)
        {
            try
            {
                var totalCoursesByMonth = await _context.Courses
                    .Where(c => c.CreateAt.Value.Year == year)
                    .GroupBy(c => c.CreateAt.Value.Month)
                    .Select(g => new { Month = g.Key, TotalCourses = g.Count() })
                    .OrderBy(g => g.Month)
                    .ToListAsync();

                int[] array = new int[12];

                foreach (var coursesByMonth in totalCoursesByMonth)
                {
                    array[coursesByMonth.Month - 1] = coursesByMonth.TotalCourses;
                }

                var jsonSerializerSettings = new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };

                var jsonData = JsonConvert.SerializeObject(array, jsonSerializerSettings);

                return new ResponeModel
                {
                    Status = "Success",
                    Message = $"Total courses created for each month in {year} retrieved successfully",
                    DataObject = jsonData
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel
                {
                    Status = "Error",
                    Message = "An error occurred while retrieving total courses by month"
                };
            }
        }

        public async Task<ResponeModel> GetYearList()
        {
            try
            {
                var distinctYears = await _context.Courses
                    .Select(c => c.CreateAt.Value.Year)
                    .Distinct()
                    .OrderBy(year => year)
                    .ToListAsync();

                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Distinct years for courses retrieved successfully",
                    DataObject = distinctYears
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel
                {
                    Status = "Error",
                    Message = "An error occurred while retrieving distinct years for courses"
                };
            }
        }

        public async Task<ResponeModel> CountStudentPerCourse()
        {
            try
            {
                var studentsPerCourse = await _context.Courses
                    .Select(c => new StudentPerCourseModel
                    {
                        CourseId = c.CourseId,
                        CourseTitle = c.Title,
                        TotalStudents = c.RegistrationCourses.Count()
                    })
                    .ToListAsync();

                return new ResponeModel
                {
                    Status = "Success",
                    Message = "Total number of students per course retrieved successfully",
                    DataObject = studentsPerCourse
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                return new ResponeModel
                {
                    Status = "Error",
                    Message = "An error occurred while retrieving total number of students per course",
                };
            }
        }

        public async Task SetCourseUnpublic(int courseId)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
            if (course == null) return;

            course.IsPublic = false;
            course.UpdateAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }


        public async Task<bool> AddRegistrationAsync(RegistrationCourse registrationCourse)
        {
            _context.RegistrationCourses.Add(registrationCourse);
            await _context.SaveChangesAsync();
            return true;
        }
    }

    public class CourseReportDto
    {
        public int CourseId { get; set; }
        public string Title { get; set; }
        public string TeacherName { get; set; }
        public string Categories { get; set; }
        public double Price { get; set; }
        public int StudentCount { get; set; }
        public int Duration { get; set; }
        public bool IsPublic { get; set; }
        public bool IsActive { get; set; }
        public DateTime? Created { get; set; }
        public DateTime? Updated { get; set; }
    }
    public enum ApproveType
    {
        DuyetKhoaHoc = 1,
        HuyXuatBan = 2
    }

    public enum ApproveStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
    public class ApproveCourseDto
    {
        public int ApproveCourseId { get; set; }
        public int CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public string? RequesterId { get; set; }
        public string? RequesterName { get; set; }
        public ApproveType Type { get; set; }
        public ApproveStatus ApproveStatus { get; set; }
        public DateTime? ApproveAt { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    public class ApproveCourseRequest
    {
        public int ApproveCourseId { get; set; }
        public bool IsApproved { get; set; }
        public string? Comment { get; set; }
    }

    public class ApproveHistoryDto
    {
        public int ApproveCourseId { get; set; }
        public int CourseId { get; set; }
        public DateTime? ApproveAt { get; set; }
        public string? Type { get; set; }
        public string? ApproveStatus { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

}
