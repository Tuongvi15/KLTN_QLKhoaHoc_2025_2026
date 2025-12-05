using System;
using System.Collections.Generic;

namespace LMSystem.Repository.Models;

public partial class ReportProblem
{
    public int ReportId { get; set; }
    public string AccountId { get; set; }

    public string? Type { get; set; }            // Article | Comment
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ReportStatus { get; set; } = "Pending";

    public int? ArticleId { get; set; }
    public int? CommentId { get; set; }

    public string? AdminResponse { get; set; }
    public string? ProcessedBy { get; set; }

    public DateTime? CreateDate { get; set; }
    public DateTime? ProcessingDate { get; set; }

    public virtual Account? Account { get; set; }
}

