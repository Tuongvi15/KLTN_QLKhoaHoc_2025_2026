using LMSystem.Repository.Interfaces;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;
        private readonly ICourseService _courseService;

        public ReportsController(IOrderRepository orderRepo, ICourseService courseService)
        {
            _orderRepo = orderRepo;
            _courseService = courseService;
        }

        // ============================================================
        // EXPORT ALL COURSES (ADMIN)
        // ============================================================
        [HttpGet("ExportCourses")]
        public async Task<IActionResult> ExportCourses(
            string? teacherId,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var fileBytes = await _courseService.ExportCoursesExcel(teacherId, fromDate, toDate);

            string fileName = $"Courses_{DateTime.Now:yyyyMMddHHmm}.xlsx";

            // ⭐ BUỘC TRÌNH DUYỆT HỎI “SAVE AS”
            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

            return File(
                fileBytes,
                "application/octet-stream" // ⭐ BẮT TRÌNH DUYỆT GIỮA NHƯ FILE BINARY
            );
        }

        // ============================================================
        // TEACHER REVENUE REPORT
        // ============================================================
        [HttpGet("GetTeacherRevenueReport")]
        public async Task<IActionResult> GetTeacherRevenueReport(
            string teacherId,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var data = await _orderRepo.GetTeacherRevenueReport(teacherId, fromDate, toDate);
            return Ok(data);
        }

        // ============================================================
        // EXPORT TEACHER REVENUE EXCEL
        // ============================================================
        [HttpGet("ExportTeacherRevenueExcel")]
        public async Task<IActionResult> ExportTeacherRevenueExcel(
            string teacherId,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var data = await _orderRepo.GetTeacherRevenueReport(teacherId, fromDate, toDate);

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("RevenueReport");

            sheet.Cells["A1"].Value = "Order Code";
            sheet.Cells["B1"].Value = "Ngày mua";
            sheet.Cells["C1"].Value = "Học viên";
            sheet.Cells["D1"].Value = "Email";
            sheet.Cells["E1"].Value = "SĐT";
            sheet.Cells["F1"].Value = "Tên khóa học";
            sheet.Cells["G1"].Value = "Course ID";
            sheet.Cells["H1"].Value = "Giá niêm yết";
            sheet.Cells["I1"].Value = "Giảm giá";
            sheet.Cells["J1"].Value = "Thanh toán";
            sheet.Cells["K1"].Value = "Phương thức";
            sheet.Cells["L1"].Value = "Trạng thái";
            sheet.Cells["M1"].Value = "Doanh thu thực nhận";

            var header = sheet.Cells["A1:M1"];
            header.Style.Font.Bold = true;
            header.Style.Font.Color.SetColor(Color.White);
            header.Style.Fill.PatternType = ExcelFillStyle.Solid;
            header.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(0, 102, 204));

            int row = 2;
            foreach (var x in data)
            {
                sheet.Cells[row, 1].Value = "'" + x.OrderId;
                sheet.Cells[row, 2].Value = x.PurchaseDate.ToString("dd/MM/yyyy HH:mm");
                sheet.Cells[row, 3].Value = x.StudentName;
                sheet.Cells[row, 4].Value = x.Email;
                sheet.Cells[row, 5].Value = x.PhoneNumber;
                sheet.Cells[row, 6].Value = x.CourseTitle;
                sheet.Cells[row, 7].Value = x.CourseId;
                sheet.Cells[row, 8].Value = x.OriginalPrice;
                sheet.Cells[row, 9].Value = x.Discount;
                sheet.Cells[row, 10].Value = x.PaidAmount;
                sheet.Cells[row, 11].Value = x.PaymentMethod;

                sheet.Cells[row, 12].Value = x.PaymentStatus switch
                {
                    "Completed" => "Hoàn thành",
                    "Failed" => "Thất bại",
                    "Pending" => "Đang xử lý",
                    _ => x.PaymentStatus
                };

                sheet.Cells[row, 13].Value = x.RevenueReceived;

                row++;
            }

            sheet.Cells.AutoFitColumns();

            string fileName = $"RevenueReport_{DateTime.Now:yyyyMMddHHmm}.xlsx";
            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

            return File(
                package.GetAsByteArray(),
                "application/octet-stream"
            );
        }

        // ============================================================
        // EXPORT TEACHER COURSES REPORT
        // ============================================================
        [HttpGet("ExportTeacherCoursesExcel")]
        public async Task<IActionResult> ExportTeacherCoursesExcel(
            string teacherId,
            string? search,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var data = await _orderRepo.GetTeacherCoursesReport(
                teacherId, search, fromDate, toDate);

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("CoursesReport");

            sheet.Cells["A1"].Value = "Course ID";
            sheet.Cells["B1"].Value = "Tên khóa học";
            sheet.Cells["C1"].Value = "Giảng viên";
            sheet.Cells["D1"].Value = "Danh mục";
            sheet.Cells["E1"].Value = "Giá";
            sheet.Cells["F1"].Value = "Số học viên";
            sheet.Cells["G1"].Value = "Doanh thu";
            sheet.Cells["H1"].Value = "Số Bài học";
            sheet.Cells["I1"].Value = "Thời lượng video";
            sheet.Cells["J1"].Value = "Ngày xuất bản";
            sheet.Cells["K1"].Value = "Cập nhật";
            sheet.Cells["L1"].Value = "Trạng thái";

            var header = sheet.Cells["A1:L1"];
            header.Style.Font.Bold = true;
            header.Style.Font.Color.SetColor(Color.White);
            header.Style.Fill.PatternType = ExcelFillStyle.Solid;
            header.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(0, 102, 204));

            int row = 2;
            int stt = 1;
            foreach (var c in data)
            {
                sheet.Cells[row, 1].Value = stt;
                sheet.Cells[row, 2].Value = c.Title;
                sheet.Cells[row, 3].Value = c.TeacherName;
                sheet.Cells[row, 4].Value = c.CategoryNames;
                sheet.Cells[row, 5].Value = c.Price;
                sheet.Cells[row, 6].Value = c.StudentCount;
                sheet.Cells[row, 7].Value = c.CourseRevenue;
                sheet.Cells[row, 8].Value = c.LessonCount;
                sheet.Cells[row, 9].Value = c.VideoDuration;
                sheet.Cells[row, 10].Value = c.PublishDate?.ToString("dd/MM/yyyy");
                sheet.Cells[row, 11].Value = c.LastUpdated?.ToString("dd/MM/yyyy");
                sheet.Cells[row, 12].Value = c.Status switch
                {
                    "Public" => "Công khai",
                    "Draft" => "Bản nháp",
                    _ => c.Status
                };

                row++;
                stt++;
            }

            sheet.Cells.AutoFitColumns();

            string fileName = $"TeacherCourses_{DateTime.Now:yyyyMMddHHmm}.xlsx";
            Response.Headers.Add("Content-Disposition", $"attachment; filename=\"{fileName}\"");

            return File(
                package.GetAsByteArray(),
                "application/octet-stream"
            );
        }
    }
}
