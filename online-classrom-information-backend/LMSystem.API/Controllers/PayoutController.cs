using LMSystem.Repository.Interfaces;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/payout")]
public class PayoutController : ControllerBase
{
    private readonly ITeacherPayoutService _service;
    private readonly ITeacherPayoutRepository _repo;

    public PayoutController(ITeacherPayoutService service, ITeacherPayoutRepository repo)
    {
        _service = service;
        _repo = repo;
    }

    // Generate payout entries for month/year (Admin triggers)
    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromQuery] int month, [FromQuery] int year)
    {
        await _service.GeneratePayoutForMonthAsync(month, year);
        return Ok(new { message = "Danh sách chi trả đã được tạo." });
    }

    // List payouts for month
    [HttpGet("list")]
    public async Task<IActionResult> List([FromQuery] int month, [FromQuery] int year)
    {
        var list = await _service.GetPayoutListAsync(month, year);
        return Ok(list);
    }

    // Detail for popup
    [HttpGet("detail/{id}")]
    public async Task<IActionResult> Detail(int id)
    {
        var dto = await _service.GetPayoutDetailAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    // Mark as paid
    [HttpPut("mark-paid/{id}")]
    public async Task<IActionResult> MarkPaid(int id)
    {
        var ok = await _service.MarkPaidAsync(id);
        if (!ok) return BadRequest(new { message = "Không thể đánh dấu đã trả (kiểm tra trạng thái/available/age/bank)." });
        return Ok(new { message = "Đã thanh toán." });
    }

    // Giảng viên xem danh sách payout của chính mình
    [HttpGet("teacher/{teacherId}")]
    public async Task<IActionResult> GetByTeacher(string teacherId)
    {
        var payouts = await _repo.GetByTeacherIdAsync(teacherId);
        return Ok(payouts);
    }

    // Giảng viên xem chi tiết payout
    [HttpGet("teacher/detail/{payoutId}")]
    public async Task<IActionResult> GetTeacherDetail(int payoutId)
    {
        var dto = await _service.GetPayoutDetailAsync(payoutId);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

}
