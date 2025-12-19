using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class CertificateTemplate
    {
        public int TemplateId { get; set; }

        // Template được gán cho khóa học nào (nullable = template mặc định của hệ thống)
        public int? CourseId { get; set; }

        // Full HTML template lưu trong DB (bao gồm CSS inline)
        public string HtmlContent { get; set; } = string.Empty;

        // Mô tả template
        public string? Description { get; set; }

        // Template nền riêng nếu cần (optional)
        public string? BackgroundUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual Course? Course { get; set; }
    }
}
