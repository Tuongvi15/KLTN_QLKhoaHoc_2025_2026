using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface ITeacherPayoutRepository
    {
        Task<TeacherPayout> CreateAsync(TeacherPayout payout);
        Task<List<TeacherPayout>> GetByMonth(int month, int year);
        Task<bool> MarkPaid(int payoutId);
    }

}
