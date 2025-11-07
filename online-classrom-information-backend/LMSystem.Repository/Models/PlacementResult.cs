using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class PlacementResult
    {
        public int ResultId { get; set; }
        public string AccountId { get; set; }
        public int PlacementTestId { get; set; }
        public double Score { get; set; }
        public string? Level { get; set; } = null!; // Beginner / Intermediate / Advanced
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        public Account Account { get; set; } = null!;
        public PlacementTest PlacementTest { get; set; } = null!;
        public ICollection<PlacementAnswer>? PlacementAnswers { get; set; }
    }
}
