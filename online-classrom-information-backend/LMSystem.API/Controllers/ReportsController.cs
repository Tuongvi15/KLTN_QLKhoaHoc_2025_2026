using LMSystem.Repository.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IOrderRepository _orderRepo;

        public ReportsController(IOrderRepository orderRepo)
        {
            _orderRepo = orderRepo;
        }

        [HttpGet("GetTeacherRevenueReport")]
        public async Task<IActionResult> GetTeacherRevenueReport(
            string teacherId,
            DateTime? fromDate,
            DateTime? toDate)
        {
            var data = await _orderRepo.GetTeacherRevenueReport(teacherId, fromDate, toDate);
            return Ok(data);
        }

        [HttpGet("GetTeacherCoursesReport")]
        public async Task<IActionResult> GetTeacherCoursesReport(
    string teacherId,
    string? search,
    DateTime? fromDate,
    DateTime? toDate)
        {
            var result = await _orderRepo.GetTeacherCoursesReport(
                teacherId, search, fromDate, toDate);

            return Ok(result);
        }

        [HttpGet("ExportTeacherRevenueExcel")]
        public async Task<IActionResult> ExportTeacherRevenueExcel(
    string teacherId,
    DateTime? fromDate,
    DateTime? toDate)
        {
            var data = await _orderRepo.GetTeacherRevenueReport(teacherId, fromDate, toDate);

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("RevenueReport");

            // Header
            sheet.Cells["A1"].Value = "Order ID";
            sheet.Cells["B1"].Value = "Ngày mua";
            sheet.Cells["C1"].Value = "User ID";
            sheet.Cells["D1"].Value = "Tên học viên";
            sheet.Cells["E1"].Value = "Email";
            sheet.Cells["F1"].Value = "SĐT";
            sheet.Cells["G1"].Value = "Khóa học";
            sheet.Cells["H1"].Value = "Course ID";
            sheet.Cells["I1"].Value = "Giá niêm yết";
            sheet.Cells["J1"].Value = "Giảm giá";
            sheet.Cells["K1"].Value = "Số tiền thanh toán";
            sheet.Cells["L1"].Value = "Phương thức";
            sheet.Cells["M1"].Value = "Trạng thái";
            sheet.Cells["N1"].Value = "Doanh thu thực nhận";

            int row = 2;
            foreach (var x in data)
            {
                sheet.Cells[row, 1].Value = x.OrderId;
                sheet.Cells[row, 2].Value = x.PurchaseDate.ToString("dd/MM/yyyy HH:mm");
                sheet.Cells[row, 3].Value = x.UserId;
                sheet.Cells[row, 4].Value = x.StudentName;
                sheet.Cells[row, 5].Value = x.Email;
                sheet.Cells[row, 6].Value = x.PhoneNumber;
                sheet.Cells[row, 7].Value = x.CourseTitle;
                sheet.Cells[row, 8].Value = x.CourseId;
                sheet.Cells[row, 9].Value = x.OriginalPrice;
                sheet.Cells[row, 10].Value = x.Discount;
                sheet.Cells[row, 11].Value = x.PaidAmount;
                sheet.Cells[row, 12].Value = x.PaymentMethod;
                sheet.Cells[row, 13].Value = x.PaymentStatus;
                sheet.Cells[row, 14].Value = x.RevenueReceived;
                row++;
            }

            sheet.Cells.AutoFitColumns();

            return File(
                package.GetAsByteArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"RevenueReport_{DateTime.Now:yyyyMMddHHmm}.xlsx");
        }
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
            sheet.Cells["C1"].Value = "Giảng viên chính";
            sheet.Cells["D1"].Value = "Danh mục";
            sheet.Cells["E1"].Value = "Giá";
            sheet.Cells["F1"].Value = "Số lượng học viên";
            sheet.Cells["G1"].Value = "Doanh thu khóa học";
            sheet.Cells["H1"].Value = "Số bài học";
            sheet.Cells["I1"].Value = "Thời lượng video";
            sheet.Cells["J1"].Value = "Ngày xuất bản";
            sheet.Cells["K1"].Value = "Cập nhật gần nhất";
            sheet.Cells["L1"].Value = "Trạng thái";

            int row = 2;

            foreach (var c in data)
            {
                sheet.Cells[row, 1].Value = c.CourseId;
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
                sheet.Cells[row, 12].Value = c.Status;

                row++;
            }

            sheet.Cells.AutoFitColumns();

            return File(
                package.GetAsByteArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"CoursesReport_{DateTime.Now:yyyyMMddHHmm}.xlsx");
        }


    }
}
