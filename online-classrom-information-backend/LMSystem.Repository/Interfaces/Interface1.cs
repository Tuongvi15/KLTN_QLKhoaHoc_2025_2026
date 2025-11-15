using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Interfaces
{
    public interface IBankAccountRepository
    {
        Task<BankAccount> AddAsync(BankAccount entity);
        Task<BankAccount?> UpdateAsync(BankAccount entity);
        Task<bool> DeleteAsync(int bankAccountId);
        Task<BankAccount?> GetByIdAsync(int bankAccountId);
        Task<IEnumerable<BankAccount>> GetByAccountIdAsync(string accountId);
        Task<BankAccount?> GetPrimaryByAccountIdAsync(string accountId);
    }
}
