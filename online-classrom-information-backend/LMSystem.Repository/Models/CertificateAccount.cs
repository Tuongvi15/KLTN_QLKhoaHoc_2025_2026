using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class CertificateAccount
    {
        public int CertificateId { get; set; }

        public string AccountId { get; set; } = string.Empty;

        public int CourseId { get; set; }

        public string CertificateCode { get; set; } = string.Empty;

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

        public string StudentName { get; set; } = string.Empty;

        public string CourseTitle { get; set; } = string.Empty;

        public DateTime? CompletionDate { get; set; }

        public string? VerifyUrl { get; set; }

        public virtual Account? Account { get; set; }
        public virtual Course? Course { get; set; }
    }
}
