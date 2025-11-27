using LMSystem.Repository.Interfaces;
using LMSystem.Repository.Models;
using LMSystem.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LMSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BankAccountsController : ControllerBase
    {
        private readonly IBankAccountRepository _repo;
        private readonly IAccountService _account;
        private readonly LMOnlineSystemDbContext _db;
        public BankAccountsController(IBankAccountRepository repo, IAccountService accountService, LMOnlineSystemDbContext db)
        {
            _repo = repo;
            _account = accountService; // FIXED
            _db = db;
        }

        private async Task<string> GetUserIdAsync()
        {
            var email = User.FindFirstValue(ClaimTypes.Name); // JWT "name" = email
            if (string.IsNullOrEmpty(email)) return string.Empty;

            var acc = await _account.GetAccountByEmail(email);
            return acc?.Id ?? string.Empty;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyAccounts()
        {
            var userId = await GetUserIdAsync();
            var items = await _repo.GetByAccountIdAsync(userId);

            var resp = items.Select(i => new
            {
                i.BankAccountId,
                i.BankName,
                AccountNumberMasked = (i.AccountNumber),
                i.AccountHolderName,
                i.Branch,
                i.IsPrimary,
                i.CreatedAt
            });

            return Ok(resp);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var ent = await _repo.GetByIdAsync(id);
            if (ent == null) return NotFound();

            var userId = await GetUserIdAsync();
            if (ent.AccountId != userId) return Forbid();

            return Ok(new
            {
                ent.BankAccountId,
                ent.BankName,
                AccountNumberMasked = (ent.AccountNumber),
                ent.AccountHolderName,
                ent.Branch,
                ent.IsPrimary,
                ent.CreatedAt
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BankAccountDto dto)
        {
            var userId = await GetUserIdAsync();

            var ent = new BankAccount
            {
                AccountId = userId,
                BankName = dto.BankName,
                AccountNumber = dto.AccountNumber,
                AccountHolderName = dto.AccountHolderName,
                Branch = dto.Branch,
                IsPrimary = dto.IsPrimary
            };

            var created = await _repo.AddAsync(ent);

            if (dto.IsPrimary)
            {
                // Hủy primary cũ
                var others = (await _repo.GetByAccountIdAsync(userId))
                    .Where(x => x.BankAccountId != created.BankAccountId && x.IsPrimary);

                foreach (var o in others)
                {
                    o.IsPrimary = false;
                    await _repo.UpdateAsync(o);
                }

                // ⭐ Update payout bank info
                await UpdatePayoutBankInfoAsync(userId, created);
            }


            return CreatedAtAction(nameof(Get), new { id = created.BankAccountId }, new
            {
                created.BankAccountId,
                created.BankName,
                AccountNumberMasked = (created.AccountNumber),
                created.AccountHolderName,
                created.Branch,
                created.IsPrimary,
                created.CreatedAt
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] BankAccountDto dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var userId = await GetUserIdAsync();
            if (existing.AccountId != userId) return Forbid();

            existing.BankName = dto.BankName;
            existing.AccountHolderName = dto.AccountHolderName;
            existing.AccountNumber = dto.AccountNumber;
            existing.Branch = dto.Branch;
            existing.IsPrimary = dto.IsPrimary;

            var updated = await _repo.UpdateAsync(existing);

            if (dto.IsPrimary)
            {
                var others = (await _repo.GetByAccountIdAsync(userId))
                    .Where(x => x.BankAccountId != updated.BankAccountId && x.IsPrimary);

                foreach (var o in others)
                {
                    o.IsPrimary = false;
                    await _repo.UpdateAsync(o);
                }

                // ⭐ Update payout bank info
                await UpdatePayoutBankInfoAsync(userId, updated);
            }


            return Ok(new
            {
                updated.BankAccountId,
                updated.BankName,
                AccountNumberMasked = (updated.AccountNumber),
                updated.AccountHolderName,
                updated.Branch,
                updated.IsPrimary,
                updated.UpdatedAt
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return NotFound();

            var userId = await GetUserIdAsync();
            if (existing.AccountId != userId) return Forbid();

            var ok = await _repo.DeleteAsync(id);
            if (!ok) return StatusCode(500, "Cannot delete");

            return NoContent();
        }

        private string Mask(string accountNumber)
        {
            if (string.IsNullOrEmpty(accountNumber)) return string.Empty;

            var clean = accountNumber.Trim();
            if (clean.Length <= 4) return new string('*', clean.Length);

            var last4 = clean[^4..];
            return new string('*', clean.Length - 4) + last4;
        }
        private async Task UpdatePayoutBankInfoAsync(string accountId, BankAccount newPrimary)
        {
            var payouts = await _db.TeacherPayouts
                .Where(p => p.TeacherId == accountId && p.Status != "Withdrawn")
                .ToListAsync();

            foreach (var p in payouts)
            {
                p.BankName = newPrimary.BankName;
                p.BankAccountNumber = newPrimary.AccountNumber;
                p.BankAccountHolder = newPrimary.AccountHolderName;
                p.BankBranch = newPrimary.Branch ?? "";
            }

            await _db.SaveChangesAsync();
        }

    }
}
