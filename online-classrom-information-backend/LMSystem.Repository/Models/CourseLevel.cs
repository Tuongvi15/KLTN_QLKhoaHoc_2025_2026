using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class CourseLevel
    {
        public int CourseLevelId { get; set; }
        public int CourseId { get; set; }
        public string Level { get; set; } = null!; // Beginner / Intermediate / Advanced

        public Course Course { get; set; } = null!;
    }
}
