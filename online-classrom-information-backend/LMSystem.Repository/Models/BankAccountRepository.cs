using Google;
using LMSystem.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class BankAccountRepository : IBankAccountRepository
    {
        private readonly LMOnlineSystemDbContext _db; // đổi tên nếu cần

        public BankAccountRepository(LMOnlineSystemDbContext db)
        {
            _db = db;
        }

        public async Task<BankAccount> AddAsync(BankAccount entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            var res = await _db.BankAccounts.AddAsync(entity);
            await _db.SaveChangesAsync();
            return res.Entity;
        }

        public async Task<bool> DeleteAsync(int bankAccountId)
        {
            var ent = await _db.BankAccounts.FindAsync(bankAccountId);
            if (ent == null) return false;
            _db.BankAccounts.Remove(ent);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<BankAccount?> GetByIdAsync(int bankAccountId)
        {
            return await _db.BankAccounts
                .Include(x => x.Account)
                .FirstOrDefaultAsync(x => x.BankAccountId == bankAccountId);
        }

        public async Task<IEnumerable<BankAccount>> GetByAccountIdAsync(string accountId)
        {
            return await _db.BankAccounts
                .Where(x => x.AccountId == accountId)
                .OrderByDescending(x => x.IsPrimary)
                .ThenByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<BankAccount?> GetPrimaryByAccountIdAsync(string accountId)
        {
            return await _db.BankAccounts
                .Where(x => x.AccountId == accountId && x.IsPrimary)
                .FirstOrDefaultAsync();
        }

        public async Task<BankAccount?> UpdateAsync(BankAccount entity)
        {
            var existing = await _db.BankAccounts.FindAsync(entity.BankAccountId);
            if (existing == null) return null;

            existing.BankName = entity.BankName;
            existing.AccountHolderName = entity.AccountHolderName;
            existing.AccountNumber = entity.AccountNumber;
            existing.Branch = entity.Branch;
            existing.IsPrimary = entity.IsPrimary;
            existing.UpdatedAt = DateTime.UtcNow;

            _db.BankAccounts.Update(existing);
            await _db.SaveChangesAsync();
            return existing;
        }
    }
    public class BankAccountDto
    {
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? Branch { get; set; }
        public bool IsPrimary { get; set; }
    }
    public class BankAccountResponseDto
    {
        public int BankAccountId { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNumberMasked { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? Branch { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
