using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class PlacementAnswer
    {
        public int AnswerId { get; set; }
        public int ResultId { get; set; }
        public int QuestionId { get; set; }
        public string SelectedAnswer { get; set; } = null!;
        public bool IsCorrect { get; set; }

        public PlacementResult PlacementResult { get; set; } = null!;
        public PlacementQuestion PlacementQuestion { get; set; } = null!;
    }
}
