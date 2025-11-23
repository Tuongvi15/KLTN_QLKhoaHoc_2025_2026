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

        public decimal TotalIncome { get; set; }     // Tổng thu nhập
        public decimal TaxAmount { get; set; }       // Thuế 10%
        public decimal NetIncome { get; set; }       // Thực nhận

        public int Month { get; set; }
        public int Year { get; set; }

        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; // Pending | Paid
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Account? Teacher { get; set; }
    }


}
