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

        public TeacherPayoutRepository(LMOnlineSystemDbContext db)
        {
            _db = db;
        }

        public async Task<TeacherPayout> CreateAsync(TeacherPayout payout)
        {
            _db.TeacherPayouts.Add(payout);
            await _db.SaveChangesAsync();
            return payout;
        }

        public async Task<List<TeacherPayout>> GetByMonth(int month, int year)
        {
            return await _db.TeacherPayouts
                .Where(x => x.Month == month && x.Year == year)
                .Include(x => x.Teacher)
                .ToListAsync();
        }

        public async Task<bool> MarkPaid(int payoutId)
        {
            var p = await _db.TeacherPayouts.FindAsync(payoutId);
            if (p == null) return false;

            p.Status = "Paid";
            await _db.SaveChangesAsync();
            return true;
        }
    }

}
