using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Repositories
{
    public class TeacherPayoutRepository : ITeacherPayoutRepository
    {
        private readonly LMOnlineSystemDbContext _db;
        public TeacherPayoutRepository(LMOnlineSystemDbContext db) { _db = db; }

        public async Task<TeacherPayout> CreateAsync(TeacherPayout entity)
        {
            var e = (await _db.TeacherPayouts.AddAsync(entity)).Entity;
            await _db.SaveChangesAsync();
            return e;
        }

        public async Task<List<TeacherPayout>> GetByMonthAsync(int month, int year)
        {
            return await _db.TeacherPayouts
                .Include(x => x.Teacher)
                .Where(x => x.Month == month && x.Year == year)
                .ToListAsync();
        }

        public async Task<TeacherPayout?> GetByIdAsync(int id)
        {
            return await _db.TeacherPayouts.Include(x => x.Teacher).FirstOrDefaultAsync(x => x.PayoutId == id);
        }

        public async Task<bool> MarkPaidAsync(int payoutId)
        {
            var p = await _db.TeacherPayouts.FindAsync(payoutId);
            if (p == null) return false;
            p.Status = "Withdrawn";
            p.PaidAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }
        public async Task<List<TeacherPayout>> GetByTeacherIdAsync(string teacherId)
        {
            return await _db.TeacherPayouts
                .Where(x => x.TeacherId == teacherId)
                .OrderByDescending(x => x.Year)
                .ThenByDescending(x => x.Month)
                .ToListAsync();
        }

        public async Task<TeacherPayout?> GetLatestByTeacherIdAsync(string teacherId)
        {
            return await _db.TeacherPayouts
                .Where(x => x.TeacherId == teacherId)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsForTeacherMonthAsync(string teacherId, int month, int year)
        {
            return await _db.TeacherPayouts.AnyAsync(x => x.TeacherId == teacherId && x.Month == month && x.Year == year);
        }
    }

    public class PayoutListItemDto
    {
        public int PayoutId { get; set; }
        public string TeacherId { get; set; } = string.Empty;
        public string TeacherName { get; set; } = string.Empty;
        public decimal TotalGross { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal AvailableAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal NetAmount { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public string Status { get; set; } = string.Empty;
        public string BankAccountNumberMasked { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public int TotalCourses { get; set; }
    }

    public class PayoutDetailDto : PayoutListItemDto
    {
        public string TeacherEmail { get; set; } = string.Empty;

        public BankDto? Bank { get; set; }
    }

    public class BankDto
    {
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
    }


}
