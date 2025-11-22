using LMSystem.Repository.Data;
using LMSystem.Repository.Helpers;
using LMSystem.Repository.Models;
using LMSystem.Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Interfaces
{
    public interface ICourseService
    {
        public Task<(IEnumerable<CourseListModel> Courses, int CurrentPage, int PageSize, int TotalCourses, int TotalPages)> GetCoursesWithFilters(CourseFilterParameters filterParams);
        //public Task<PagedList<CourseListModel>> GetAllCourse(PaginationParameter paginationParameter);
        Task<IEnumerable<Course>> GetCoursesByTeacherIdAsync(string teacherId);
        Task<IEnumerable<object>> GetStudentsInCourseAsync(int courseId, string teacherId);
        Task<ResponeModel> PublishCourse(int courseId, bool isActive);
        Task<IEnumerable<object>> GetStudentsInCoursesAsync(List<int> courseIds, string teacherId);
        public Task<IEnumerable<Course>> GetTopCoursesByStudentJoined(int numberOfCourses);
        public Task<IEnumerable<Course>> GetTopCoursesBySales(int numberOfCourses);
        Task<bool> CheckStudentStillLearning(int courseId);
        Task<List<CourseReportDto>> GetCoursesReport(string? teacherId, DateTime? fromDate, DateTime? toDate);
        Task<byte[]> ExportCoursesExcel(string? teacherId, DateTime? fromDate, DateTime? toDate);
        public Task<IEnumerable<Course>> GetTopCoursesByRating(int numberOfCourses);
        Task<ResponeModel> RequestApproveCourse(int courseId, string teacherId);
        Task<ResponeModel> ApproveCourse(ApproveCourseRequest request);
        Task<List<ApproveHistoryDto>> GetApproveHistory(int courseId);
        Task<ResponeModel> RequestUnpublishCourse(int courseId, string teacherId, string? reason);
        public Task<Course> GetCourseDetailByIdAsync(int courseId);
        public Task<CourseListModel> GetCourseDetailByCourseIdAsync(int courseId);
        public Task<ResponeModel> AddCourse(AddCourseModel addCourseModel);
        public Task<ResponeModel> GetFullCourseDetail();
        public Task<ResponeModel> UpdateCourse(UpdateCourseModel updateCourseModel);
        public Task<ResponeModel> DeleteCourse(int courseId);
        public Task<ResponeModel> CountTotalCourse();
        public Task<ResponeModel> CountTotalCourseUpToDate(DateTime to);
        public Task<ResponeModel> CountTotalCourseByMonth(int year);
        public Task<ResponeModel> GetYearList();
        public Task<ResponeModel> CountStudentPerCourse();
    }
}
