using LMSystem.Repository.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMSystem.API.Controllers
{
    [Route("api/revenue")]
    public class RevenueController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;

        public RevenueController(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        // ADMIN hoặc TEACHER đều gọi được
        [HttpGet("course-detail")]
        public async Task<IActionResult> GetCourseRevenueDetail(
    [FromQuery] string? teacherId,
    [FromQuery] int? month,
    [FromQuery] int? year)
        {
            var result = await _orderRepository.GetCourseRevenueDetail(teacherId, month, year);
            return Ok(result);
        }

    }
}
