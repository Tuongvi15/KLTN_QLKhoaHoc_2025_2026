using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Services
{
    public class TeacherPayoutService : ITeacherPayoutService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ITeacherPayoutRepository _payoutRepo;
        private readonly IAccountRepository _accountRepo;
        private readonly IBankAccountRepository _bankRepo;

        public TeacherPayoutService(
            IOrderRepository orderRepository,
            ITeacherPayoutRepository payoutRepo,
            IAccountRepository accountRepo,
            IBankAccountRepository bankRepo)
        {
            _orderRepository = orderRepository;
            _payoutRepo = payoutRepo;
            _accountRepo = accountRepo;
            _bankRepo = bankRepo;
        }

        public async Task GeneratePayout(int month, int year)
        {
            var teachers = await _accountRepo.GetAllTeachers();

            foreach (var teacher in teachers)
            {
                // lấy tổng doanh thu của giáo viên
                var revenue = await _orderRepository.GetCourseRevenueDetail(teacher.Id, month, year);

                if (revenue.Count == 0) continue;

                decimal teacherIncome = revenue.Sum(x => (decimal)x.TeacherIncome);

                // Thuế 10%
                decimal tax = teacherIncome >= 2000000 ? teacherIncome * 0.10m : 0;
                decimal net = teacherIncome - tax;

                // Lấy tài khoản ngân hàng chính
                var bank = await _bankRepo.GetPrimaryByAccountIdAsync(teacher.Id);
                if (bank == null) continue;

                // Tạo payout record
                var payout = new TeacherPayout
                {
                    TeacherId = teacher.Id,
                    TotalIncome = teacherIncome,
                    TaxAmount = tax,
                    NetIncome = net,
                    Month = month,
                    Year = year,
                    BankName = bank.BankName,
                    BankAccountNumber = bank.AccountNumber,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                };

                await _payoutRepo.CreateAsync(payout);
            }
        }
    }

}
