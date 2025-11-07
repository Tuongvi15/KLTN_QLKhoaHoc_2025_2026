using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class FieldCategory
    {
        public int FieldCategoryId { get; set; }

        public int FieldId { get; set; }
        public int CategoryId { get; set; }

        public Field Field { get; set; } = null!;
        public Category Category { get; set; } = null!;
    }
}
