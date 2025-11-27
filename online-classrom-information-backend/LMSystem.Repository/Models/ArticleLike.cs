using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class ArticleLike
    {
        public int LikeId { get; set; }
        public int ArticleId { get; set; }
        public string AccountId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ArticlePost? Article { get; set; }
        public virtual Account? Account { get; set; }
    }
}
