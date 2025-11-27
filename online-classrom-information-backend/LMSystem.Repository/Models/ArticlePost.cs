using LMSystem.Repository.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class ArticlePost
    {
        public int ArticleId { get; set; }
        public string AccountId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? ContentHtml { get; set; }         // lưu HTML từ editor
        public string? CoverImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ArticleStatus Status { get; set; } = ArticleStatus.Draft;
        public string? BlockReason { get; set; }
        public string? BlockedBy { get; set; }   // AccountId của Admin/Staff
        public DateTime? BlockedAt { get; set; }

        public int TotalLikes { get; set; } = 0;
        public int TotalComments { get; set; } = 0;

        // Navigation
        public virtual Account? Account { get; set; }
        public virtual ICollection<ArticleComment> Comments { get; set; } = new List<ArticleComment>();
        public virtual ICollection<ArticleLike> Likes { get; set; } = new List<ArticleLike>();
    }
}
