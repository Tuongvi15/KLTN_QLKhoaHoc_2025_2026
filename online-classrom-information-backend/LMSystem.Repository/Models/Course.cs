using System;
using System.Collections.Generic;

namespace LMSystem.Repository.Models;

public partial class Course
{
    public int CourseId { get; set; }
    public string AccountId { get; set; } = "bd031fd1-3d58-4646-b899-4d8c53fa29ce";

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public string? VideoPreviewUrl { get; set; }

    public double? Price { get; set; }

    public double? SalesCampaign { get; set; }

    public string? Title { get; set; }

    public bool? IsPublic { get; set; }

    public DateTime? CreateAt { get; set; }

    public DateTime? PublicAt { get; set; }

    public DateTime? UpdateAt { get; set; }

    public int TotalDuration { get; set; }

    public bool? CourseIsActive { get; set; }

    public string? KnowdledgeDescription { get; set; }

    public string? CourseLevel { get; set; }

    public string? LinkCertificated {  get; set; }
    public virtual Account? Account { get; set; }

    public virtual ICollection<CourseCategory> CourseCategories { get; set; } = new List<CourseCategory>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<RegistrationCourse> RegistrationCourses { get; set; } = new List<RegistrationCourse>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

    public virtual ICollection<WishList> WishLists { get; set; } = new List<WishList>();

    public virtual ICollection<LinkCertificateAccount> LinkCertificateAccounts { get; set; } = new List<LinkCertificateAccount>();
}
