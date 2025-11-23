using LMSystem.Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Services.Interfaces
{
    public interface ITeacherPayoutService
    {
        Task GeneratePayoutForMonthAsync(int month, int year);
        Task<List<PayoutListItemDto>> GetPayoutListAsync(int month, int year);
        Task<PayoutDetailDto?> GetPayoutDetailAsync(int payoutId);
        Task<bool> MarkPaidAsync(int payoutId);
    }


}
