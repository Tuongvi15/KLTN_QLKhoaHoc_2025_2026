using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class PlacementTest
    {
        public int PlacementTestId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        public ICollection<PlacementQuestion>? PlacementQuestions { get; set; }
        public ICollection<PlacementResult>? PlacementResults { get; set; }
    }
}
