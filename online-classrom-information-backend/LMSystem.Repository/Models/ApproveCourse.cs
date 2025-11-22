using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public partial class ApproveCourse
    {
        public int ApproveCourseId { get; set; }
        public int CourseId { get; set; }
        public DateTime? ApproveAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Type { get; set; }
        public string? ApproveStatus { get; set; }
        public string? Reason { get; set; }

        public virtual Course? Course { get; set; }
    }
}
