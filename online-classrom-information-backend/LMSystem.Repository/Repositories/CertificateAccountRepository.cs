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
    public class CertificateAccountRepository : ICertificateAccountRepository
    {
        private readonly LMOnlineSystemDbContext _db;

        public CertificateAccountRepository(LMOnlineSystemDbContext db)
        {
            _db = db;
        }

        public async Task<bool> ExistsAsync(string accountId, int courseId)
        {
            return await _db.CertificateAccounts
                .AnyAsync(c => c.AccountId == accountId && c.CourseId == courseId);
        }

        public async Task<CertificateAccount?> GetByAccountAndCourseAsync(
     string accountId,
     int courseId
 )
        {
            return await _db.CertificateAccounts
                .Include(c => c.Course)
                    .ThenInclude(course => course.Account)
                .FirstOrDefaultAsync(c =>
                    c.AccountId == accountId &&
                    c.CourseId == courseId
                );
        }


        public async Task<CertificateAccount?> GetByIdAsync(int certificateId)
        {
            return await _db.CertificateAccounts
                .FirstOrDefaultAsync(c => c.CertificateId == certificateId);
        }

        public async Task<IEnumerable<CertificateAccount>> GetByAccountAsync(string accountId)
        {
            return await _db.CertificateAccounts
                .Where(c => c.AccountId == accountId)
                .OrderByDescending(c => c.IssuedAt)
                .ToListAsync();
        }

        public async Task<CertificateAccount> CreateAsync(CertificateAccount cert)
        {
            _db.CertificateAccounts.Add(cert);
            await _db.SaveChangesAsync();
            return cert;
        }
    }
}
