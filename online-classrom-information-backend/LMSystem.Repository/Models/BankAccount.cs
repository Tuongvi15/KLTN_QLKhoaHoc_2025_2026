using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public partial class BankAccount
    {
        public int BankAccountId { get; set; }

        // FK to Account (IdentityUser derived)
        public string AccountId { get; set; } = string.Empty;

        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountHolderName { get; set; } = string.Empty;
        public string? Branch { get; set; }

        // Mark one as primary if user wants multiple accounts
        public bool IsPrimary { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual Account? Account { get; set; }
    }
}
