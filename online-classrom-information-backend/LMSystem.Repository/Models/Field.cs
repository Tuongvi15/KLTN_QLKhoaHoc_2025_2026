using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Models
{
    public class Field
    {
        public int FieldId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public ICollection<PlacementTest>? PlacementTests { get; set; }
        public ICollection<FieldCategory>? FieldCategories { get; set; }
    }
}
