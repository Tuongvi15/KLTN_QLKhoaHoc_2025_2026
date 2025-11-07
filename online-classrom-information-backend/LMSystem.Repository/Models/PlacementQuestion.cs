using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class PlacementQuestion
    {
        public int QuestionId { get; set; }
        public int PlacementTestId { get; set; }
        public string QuestionText { get; set; } = null!;
        public string AnswerOptions { get; set; } = null!; // Dạng: "A.xxx|B.yyy|C.zzz|D.ttt"
        public string CorrectAnswer { get; set; } = null!;
        public byte DifficultyLevel { get; set; } // 1=Easy, 2=Medium, 3=Hard

        public string? ImageUrl { get; set; } // ✅ Hình ảnh minh họa câu hỏi (Firebase URL)

        public PlacementTest PlacementTest { get; set; } = null!;
        public ICollection<PlacementAnswer>? PlacementAnswers { get; set; }
    }
}
