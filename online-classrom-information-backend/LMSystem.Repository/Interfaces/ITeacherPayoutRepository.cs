using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    using LMSystem.Repository.Models;

    public interface ITeacherPayoutRepository
    {
        Task<TeacherPayout> CreateAsync(TeacherPayout entity);
        Task<List<TeacherPayout>> GetByMonthAsync(int month, int year);
        Task<TeacherPayout?> GetByIdAsync(int id);
        Task<bool> MarkPaidAsync(int payoutId);
        Task<bool> ExistsForTeacherMonthAsync(string teacherId, int month, int year);
        Task<List<TeacherPayout>> GetByTeacherIdAsync(string teacherId);

        Task<TeacherPayout?> GetLatestByTeacherIdAsync(string teacherId);

    }


}
