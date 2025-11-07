using LMSystem.Library;
using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Library;
using LMSystem.Repository.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Net.payOS.Types;
using System.Collections.Generic;

namespace LMSystem.API.Controllers
{
    [Route("api/payos")]
    [ApiController]
    public class PayOSController : ControllerBase
    {
        private readonly PayOSService _payOSService;
        private readonly IOrderRepository _orderRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly INotificationRepository _notificationRepository;

        public PayOSController(PayOSService payOSService, IOrderRepository orderRepository, ICourseRepository courseRepository, INotificationRepository notificationRepository)
        {
            _payOSService = payOSService;
            _orderRepository = orderRepository;
            _courseRepository = courseRepository;
            _notificationRepository = notificationRepository;
        }

        [HttpPost("CreatePaymentLink")]
        public async Task<IActionResult> CreatePaymentLink([FromQuery] int orderId)
        {
            var order = await _orderRepository.GetOrdersByIdAsync(orderId);
            if (order == null) return NotFound("Không tìm thấy đơn hàng");
            long orderCode = long.Parse(DateTimeOffset.Now.ToString("yyMMddHHmmss"));
            string returnUrl = $"http://localhost:5173/payment/success?orderCode={order.OrderCode}";
            string cancelUrl = $"http://localhost:5173/payment/failed?orderCode={order.OrderCode}";
            var items = new List<ItemData>
            {
                new ItemData(order.Course.Title, 1, (int)order.TotalPrice)
            };

            var payOSModel = new PaymentData(
                orderCode: orderCode,
                amount: (int)order.TotalPrice,
                description: "Thanh toan don hang",
                items: items,
                returnUrl: returnUrl,
                cancelUrl: cancelUrl
            );
            order.OrderCode = orderCode;
            order.PaymentMethod = "PayOS";
            await _orderRepository.UpdateOrder(order);
            var result = await _payOSService.CreatePaymentLink(payOSModel);
            return Ok(result.checkoutUrl);
        }

        [HttpPost("Webhook")]
        public async Task<IActionResult> Webhook([FromBody] WebhookType webhookBody)
        {
            try
            {
                // Xác thực dữ liệu từ PayOS
                var data = _payOSService.VerifyPaymentWebhookData(webhookBody);
                if (data == null)
                {
                    Console.WriteLine("⚠️ Dữ liệu webhook không hợp lệ");
                    return BadRequest(new { success = false, message = "Webhook data invalid" });
                }

                Console.WriteLine($"📩 Nhận webhook từ PayOS - orderCode: {data.orderCode}, code: {data.code}");

                // Phân tích kết quả thanh toán từ PayOS
                string status = data.code == "00" ? "Completed" : "Failed";

                // Gọi repository để cập nhật trạng thái + xử lý đăng ký / thông báo
                bool success = await _orderRepository.UpdateOrderStatus(data.orderCode.ToString(), status);

                if (!success)
                {
                    Console.WriteLine($"⚠️ Không thể cập nhật trạng thái đơn hàng {data.orderCode}");
                    return NotFound(new { success = false, message = "Không tìm thấy đơn hàng" });
                }

                Console.WriteLine($"✅ Đã xử lý webhook cho đơn hàng {data.orderCode} với trạng thái {status}");
                return Ok(new { success = true, message = $"Webhook xử lý thành công - Trạng thái {status}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Webhook Error: {ex.Message}");
                return BadRequest(new { success = false, error = ex.Message });
            }
        }


        [HttpGet("GetOrderByPayOS")]
        public async Task<IActionResult> GetOrderByPayOS([FromQuery] string orderCode)
        {
            try
            {
                var result = await _payOSService.GetPaymentLinkInformation(long.Parse(orderCode));
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPost("ConfirmPayment")]
        public async Task<IActionResult> ConfirmPayment([FromQuery] string orderCode, [FromQuery] string status)
        {
            var success = await _orderRepository.UpdateOrderStatus(orderCode, status);
            if (!success)
                return BadRequest(new { success = false, message = "Không thể cập nhật đơn hàng" });

            return Ok(new { success = true, message = "Xử lý thanh toán hoàn tất" });
        }


    }

}
