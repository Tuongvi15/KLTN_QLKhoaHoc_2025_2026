using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using LMSystem.Services.Interfaces;
using Microsoft.Identity.Client;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Services
{
    public class CourseService : ICourseService
    {
        private readonly ICourseRepository _courseRepository;

        public CourseService(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }

        public async Task<bool> CheckStudentStillLearning(int courseId)
        {
            return await _courseRepository.CheckStudentStillLearning(courseId);
        }

        public async Task<List<CourseReportDto>> GetCoursesReport(string? teacherId, DateTime? fromDate, DateTime? toDate)
        {
            return await _courseRepository.GetCoursesReport(teacherId, fromDate, toDate);
        }

        public async Task<byte[]> ExportCoursesExcel(string? teacherId, DateTime? fromDate, DateTime? toDate)
        {
            var data = await _courseRepository.GetCoursesReport(teacherId, fromDate, toDate);
            return ExcelExporter.ExportCourses(data);
        }
        public async Task<ResponeModel> RequestUnpublishCourse(int courseId, string teacherId, string? reason)
        {
            var approve = new ApproveCourse
            {
                CourseId = courseId,
                ApproveStatus = ApproveStatus.Approved.ToString(), // ✔ xử lý luôn
                Type = ApproveType.HuyXuatBan.ToString(),
                Reason = reason,
                ApproveAt = DateTime.UtcNow, // ✔ có thời gian xử lý
                CreatedAt = DateTime.UtcNow
            };

            await _courseRepository.CreateApproveCourse(approve);

            // ✔ Update khóa học ngay
            await _courseRepository.SetCourseUnpublic(courseId);

            return new ResponeModel
            {
                Status = "Success",
                Message = "Unpublish completed immediately by admin"
            };
        }


        public async Task<(IEnumerable<CourseListModel> Courses, int CurrentPage, int PageSize, int TotalCourses, int TotalPages)> GetCoursesWithFilters(CourseFilterParameters filterParams)
        {
            return await _courseRepository.GetCoursesWithFilters(filterParams);
        }

        //public async Task<PagedList<CourseListModel>> GetAllCourse(PaginationParameter paginationParameter)
        //{
        //    return await _courseRepository.GetAllCourse(paginationParameter);
        //}
        public async Task<IEnumerable<object>> GetStudentsInCourseAsync(int courseId, string teacherId)
        {
            return await _courseRepository.GetStudentsInCourseAsync(courseId, teacherId);
        }

        public async Task<ResponeModel> PublishCourse(int courseId, bool isActive)
        {
            return await _courseRepository.PublishCourse(courseId, isActive);
        }

        public async Task<IEnumerable<object>> GetStudentsInCoursesAsync(List<int> courseIds, string teacherId)
        {
            return await _courseRepository.GetStudentsInCoursesAsync(courseIds, teacherId);
        }

        public async Task<IEnumerable<Course>> GetCoursesByTeacherIdAsync(string teacherId)
        {
            return await _courseRepository.GetCoursesByTeacherIdAsync(teacherId);
        }
        public async Task<ResponeModel> RequestApproveCourse(int courseId, string teacherId)
        {
            var course = await _courseRepository.GetCourseByIdAsync(courseId);

            if (course == null)
                return new ResponeModel { Status = "Error", Message = "Course not found" };


            var approve = new ApproveCourse
            {
                CourseId = courseId,
                ApproveAt = null,
                ApproveStatus = ApproveStatus.Pending.ToString(),
                Type = ApproveType.DuyetKhoaHoc.ToString(),
                CreatedAt = DateTime.UtcNow,
                Reason = null
            };

            await _courseRepository.CreateApproveCourse(approve);

            return new ResponeModel { Status = "Success", Message = "Request submitted successfully" };
        }

        public async Task<List<ApproveHistoryDto>> GetApproveHistory(int courseId)
        {
            var list = await _courseRepository.GetApproveHistory(courseId);

            return list
                .OrderByDescending(x => x.ApproveAt)  // sort newest → oldest
                .Select(x => new ApproveHistoryDto
                {
                    ApproveCourseId = x.ApproveCourseId,
                    CourseId = x.CourseId,
                    ApproveAt = x.ApproveAt,
                    Type = x.Type,
                    ApproveStatus = x.ApproveStatus,
                    Comment = x.Reason,
                    CreatedAt = x.CreatedAt
                })
                .ToList();
        }


        public async Task<ResponeModel> ApproveCourse(ApproveCourseRequest request)
        {
            var approve = await _courseRepository.GetApproveCourseById(request.ApproveCourseId);
            if (approve == null)
                return new ResponeModel { Status = "Error", Message = "Request not found" };

            approve.ApproveStatus = request.IsApproved
                ? ApproveStatus.Approved.ToString()
                : ApproveStatus.Rejected.ToString();

            approve.Reason = request.Comment;
            approve.ApproveAt = DateTime.UtcNow;

            await _courseRepository.UpdateApproveCourse(approve);

            if (request.IsApproved)
            {
                if (approve.Type == ApproveType.DuyetKhoaHoc.ToString())
                {
                    await _courseRepository.SetCoursePublic(approve.CourseId);
                }
                else if (approve.Type == ApproveType.HuyXuatBan.ToString())
                {
                    await _courseRepository.SetCourseUnpublic(approve.CourseId);
                }
            }

            return new ResponeModel
            {
                Status = "Success",
                Message = request.IsApproved ? "Course approved" : "Course rejected"
            };
        }


        public async Task<IEnumerable<Course>> GetTopCoursesByStudentJoined(int numberOfCourses)
        {
            return await _courseRepository.GetTopCoursesByStudentJoined(numberOfCourses);
        }

        public async Task<IEnumerable<Course>> GetTopCoursesByRating(int numberOfCourses)
        {
            return await _courseRepository.GetTopCoursesByRating(numberOfCourses);
        }
        public async Task<IEnumerable<Course>> GetTopCoursesBySales(int numberOfCourses)
        {
            return await _courseRepository.GetTopCoursesBySales(numberOfCourses);
        }

        public async Task<Course> GetCourseDetailByIdAsync(int courseId)
        {
            return await _courseRepository.GetCourseDetailByIdAsync(courseId);
        } 
        
        public async Task<CourseListModel> GetCourseDetailByCourseIdAsync(int courseId)
        {
            return await _courseRepository.GetCourseDetailByCourseIdAsync(courseId);
        }

        public async Task<ResponeModel> AddCourse(AddCourseModel addCourseModel)
        {
            return await _courseRepository.AddCourse(addCourseModel);
        }

        public async Task<ResponeModel> GetFullCourseDetail()
        {
            return await _courseRepository.GetFullCourseDetail();
        }
        public async Task<ResponeModel> DeleteCourse(int courseId)
        {
            return await _courseRepository.DeleteCourse(courseId);
        }

        public async Task<ResponeModel> UpdateCourse(UpdateCourseModel updateCourseModel)
        {
            return await _courseRepository.UpdateCourse(updateCourseModel);
        }

        public async Task<ResponeModel> CountTotalCourse()
        {
            return await _courseRepository.CountTotalCourse();
        }

        public async Task<ResponeModel> CountTotalCourseUpToDate(DateTime to)
        {
            return await _courseRepository.CountTotalCourseUpToDate(to);
        }

        public async Task<ResponeModel> CountTotalCourseByMonth(int year)
        {
            return await _courseRepository.CountTotalCourseByMonth(year);
        }

        public async Task<ResponeModel> GetYearList()
        {
            return await _courseRepository.GetYearList();
        }

        public async Task<ResponeModel> CountStudentPerCourse()
        {
            return await _courseRepository.CountStudentPerCourse();
        }
        public class ExcelExporter
        {
            public static byte[] ExportCourses(List<CourseReportDto> data)
            {
                using var package = new ExcelPackage();
                var sheet = package.Workbook.Worksheets.Add("Courses");

                string[] headers =
                {
        "STT", "Khóa học", "Giảng viên", "Danh mục", "Giá",
        "Số học viên", "Thời lượng", "Xuất bản", "Hoạt động",
        "Ngày tạo", "Cập nhật"
    };

                // Header
                for (int i = 0; i < headers.Length; i++)
                    sheet.Cells[1, i + 1].Value = headers[i];

                var headerRange = sheet.Cells[1, 1, 1, headers.Length];
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
                headerRange.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(0, 102, 204));
                headerRange.Style.Font.Color.SetColor(Color.White);

                // ⭐ STT bắt đầu từ 1
                int row = 2;
                int stt = 1;

                foreach (var c in data)
                {
                    sheet.Cells[row, 1].Value = stt;                      // <-- STT
                    sheet.Cells[row, 2].Value = c.Title;
                    sheet.Cells[row, 3].Value = c.TeacherName;
                    sheet.Cells[row, 4].Value = c.Categories;
                    sheet.Cells[row, 5].Value = c.Price;
                    sheet.Cells[row, 6].Value = c.StudentCount;
                    sheet.Cells[row, 7].Value = c.Duration;
                    sheet.Cells[row, 8].Value = c.IsPublic ? "Có" : "Không";
                    sheet.Cells[row, 9].Value = c.IsActive ? "Hoạt động" : "Không";
                    sheet.Cells[row, 10].Value = c.Created?.ToString("dd/MM/yyyy");
                    sheet.Cells[row, 11].Value = c.Updated?.ToString("dd/MM/yyyy");

                    row++;
                    stt++;   // ⭐ tăng dần
                }

                sheet.Cells.AutoFitColumns();
                return package.GetAsByteArray();
            }

        }

    }
}
