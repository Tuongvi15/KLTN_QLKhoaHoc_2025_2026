using System;
using System.Collections.Generic;

namespace LMSystem.Repository.Models;

public partial class Category
{
    public int CatgoryId { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<CourseCategory> CourseCategories { get; set; } = new List<CourseCategory>();
    public virtual ICollection<PlacementTest> PlacementTests { get; set; } = new List<PlacementTest>();
}
