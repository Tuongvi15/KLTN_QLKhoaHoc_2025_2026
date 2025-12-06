using LMSystem.Repository.Helpers;
using LMSystem.Repository.Repositories;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportProblemController : ControllerBase
    {
        private readonly IReportProblemService _reportProblemService;

        public ReportProblemController(IReportProblemService reportProblemService)
        {
            _reportProblemService = reportProblemService;
        }

        // ==============================
        // 📌 1) Lấy danh sách report
        // ==============================
        [HttpGet("GetAllRequest")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllRequest([FromQuery] PaginationParameter paginationParameter)
        {
            try
            {
                var response = await _reportProblemService.GetAllReportProblem(paginationParameter);

                var metadata = new
                {
                    response.TotalCount,
                    response.PageSize,
                    response.CurrentPage,
                    response.TotalPages,
                    response.HasNext,
                    response.HasPrevious
                };

                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));

                if (!response.Any())
                    return NotFound();

                return Ok(response);
            }
            catch
            {
                return BadRequest("Failed to load report list.");
            }
        }

        // ==============================
        // 📌 2) User gửi report
        // ==============================
        [HttpPost("SendRequest")]
        [Authorize]
        public async Task<IActionResult> SendRequest([FromBody] SendRequestModel model)
        {
            if (model == null)
                return BadRequest("Invalid report data");

            var result = await _reportProblemService.SendRequestAsync(model);
            return Ok(result);
        }

        // ==============================
        // 📌 3) Lấy chi tiết report (để popup)
        // ==============================
        [HttpGet("Detail/{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var detail = await _reportProblemService.GetReportDetail(id);

            if (detail == null)
                return NotFound("Report not found");

            return Ok(detail);
        }

        // ==============================
        // 📌 4) Admin xử lý report
        // ==============================
        [HttpPut("ResolveRequest")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> ResolveRequest([FromBody] ResolveRequestModel model)
        {
            if (model == null)
                return BadRequest("Invalid request");

            var result = await _reportProblemService.ResolveRequestAsync(model);

            if (result.Status == "Error")
                return Conflict(result);

            return Ok(result);
        }
    }
}
