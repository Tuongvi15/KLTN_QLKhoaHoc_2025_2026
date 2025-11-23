using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class TeacherPayout
    {
        public int PayoutId { get; set; }
        public string TeacherId { get; set; } = string.Empty;

        // gross amount = sum of teacher share for orders in the target month
        public decimal TotalGross { get; set; }

        // pending portion (orders not yet 30 days old)
        public decimal PendingAmount { get; set; }

        // available portion (orders > 30 days)
        public decimal AvailableAmount { get; set; }

        // tax applied on AvailableAmount
        public decimal TaxAmount { get; set; }

        // net to pay = AvailableAmount - TaxAmount
        public decimal NetAmount { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankAccountHolder { get; set; } = string.Empty;
        public string BankBranch { get; set; } = string.Empty;

        // Pending | Available | Withdrawn | Locked
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        // Navigation
        public virtual Account? Teacher { get; set; }
    }
}
