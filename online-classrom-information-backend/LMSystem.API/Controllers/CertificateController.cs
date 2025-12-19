using LMSystem.API.Helper;
using LMSystem.Repository.Interfaces;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
using static CertificateService;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CertificateController : ControllerBase
    {
        private readonly ICertificateService _certificateService;
        private readonly ICertificateAccountRepository _certRepo;
        private readonly ICertificateTemplateRepository _templateRepo;
        private readonly ICertificateRenderService _renderService;

        public CertificateController(
            ICertificateService certificateService,
            ICertificateAccountRepository certRepo,
            ICertificateTemplateRepository templateRepo,
            ICertificateRenderService renderService)
        {
            _certificateService = certificateService;
            _certRepo = certRepo;
            _templateRepo = templateRepo;
            _renderService = renderService;
        }

        // =========================
        // USER
        // =========================

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> MyCertificates()
        {
            var accountId = User.FindFirstValue(ClaimTypes.Name);
            var res = await _certificateService.GetMyCertificatesAsync(accountId);
            return Ok(res);
        }

        // =========================
        // ADMIN ISSUE
        // =========================

        [HttpPost("issue")]
        public async Task<IActionResult> Issue([FromBody] IssueCertificateRequest req)
        {
            var res = await _certificateService.IssueCertificateAsync(req.AccountId, req.CourseId);
            return Ok(res);
        }

        // =========================
        // VIEW PDF (ON-DEMAND)
        // =========================

        [AllowAnonymous]
        [HttpGet("view-html/account/{accountId}/course/{courseId}")]
        public async Task<IActionResult> ViewCertificateHtml(
    string accountId,
    int courseId
)
        {
            var cert = await _certRepo.GetByAccountAndCourseAsync(accountId, courseId);
            if (cert == null) return NotFound();

            var teacher = cert.Course?.Account;
            var teacherName = teacher != null
                ? $"{teacher.FirstName} {teacher.LastName}".Trim()
                : "Giảng Viên";

            string html = CertificateHtmlTemplateHelper.CertificateTemplate(
                cert.StudentName,
                cert.CourseTitle,
                cert.IssuedAt.ToString("dd/MM/yyyy"),
                teacherName,
                cert.CertificateCode
            );

            return Content(html, "text/html; charset=utf-8");
        }

    }
}
