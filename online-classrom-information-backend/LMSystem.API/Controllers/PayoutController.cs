using LMSystem.Repository.Interfaces;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMSystem.API.Controllers
{
    [ApiController]
    [Route("api/payout")]
    public class PayoutController : ControllerBase
    {
        private readonly ITeacherPayoutService _service;
        private readonly ITeacherPayoutRepository _repo;

        public PayoutController(
            ITeacherPayoutService service,
            ITeacherPayoutRepository repo)
        {
            _service = service;
            _repo = repo;
        }

        // Admin nhấn nút để tính
        [HttpPost("generate")]
        public async Task<IActionResult> Generate(int month, int year)
        {
            await _service.GeneratePayout(month, year);
            return Ok("Đã tạo danh sách trả nhuận bút.");
        }

        // Admin đánh dấu đã trả
        [HttpPut("mark-paid/{id}")]
        public async Task<IActionResult> MarkPaid(int id)
        {
            var ok = await _repo.MarkPaid(id);
            return ok ? Ok("Đã thanh toán") : NotFound();
        }

        // Lấy danh sách payout theo tháng
        [HttpGet("list")]
        public async Task<IActionResult> List(int month, int year)
        {
            var list = await _repo.GetByMonth(month, year);
            return Ok(list);
        }
    }

}
