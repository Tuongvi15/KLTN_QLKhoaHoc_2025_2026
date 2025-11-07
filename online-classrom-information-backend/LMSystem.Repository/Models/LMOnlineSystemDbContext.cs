using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LMSystem.Repository.Models;

public partial class LMOnlineSystemDbContext : IdentityDbContext<Account>
{
    public LMOnlineSystemDbContext()
    {
    }

    public LMOnlineSystemDbContext(DbContextOptions<LMOnlineSystemDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Account { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseCategory> CourseCategories { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<RatingCourse> RatingCourses { get; set; }

    public virtual DbSet<RegistrationCourse> RegistrationCourses { get; set; }

    public virtual DbSet<ReportProblem> ReportProblems { get; set; }

    public virtual DbSet<Section> Sections { get; set; }

    public virtual DbSet<Step> Steps { get; set; }

    public virtual DbSet<StepCompleted> StepCompleteds { get; set; }

    public virtual DbSet<WishList> WishLists { get; set; }

    public virtual DbSet<LinkCertificateAccount> LinkCertificateAccounts  { get; set; }

    public virtual DbSet<Quiz> Quizzes { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<AnswerHistory> AnswerHistories { get; set; }

    public virtual DbSet<Field> Fields { get; set; }
    public virtual DbSet<FieldCategory> FieldCategories { get; set; }
    public virtual DbSet<PlacementTest> PlacementTests { get; set; }
    public virtual DbSet<PlacementQuestion> PlacementQuestions { get; set; }
    public virtual DbSet<PlacementResult> PlacementResults { get; set; }
    public virtual DbSet<PlacementAnswer> PlacementAnswers { get; set; }



    //    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    //        => optionsBuilder.UseSqlServer("Server=LAPTOP-9COIMEED;uid=sa;pwd=12345;database=LMOnlineSystemDB;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Account>().ToTable("Accounts");

        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_Account");

            entity.ToTable("Accounts");
            entity.Property(e => e.Biography).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(155);
            entity.Property(e => e.LastName).HasMaxLength(155);
            entity.Property(e => e.RefreshToken).HasMaxLength(155);
            entity.Property(e => e.RefreshTokenExpiryTime);
            entity.Property(e => e.Sex).HasMaxLength(40);
            entity.Property(e => e.Status)
                .HasMaxLength(40)
                .IsFixedLength();
        });

        modelBuilder.Entity<Field>(entity =>
        {
            entity.HasKey(e => e.FieldId);
            entity.ToTable("Field");
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Description).HasMaxLength(300);
        });
        modelBuilder.Entity<FieldCategory>(entity =>
        {
            entity.HasKey(e => e.FieldCategoryId);
            entity.ToTable("FieldCategory");

            entity.HasOne(e => e.Field)
                .WithMany(d => d.FieldCategories)
                .HasForeignKey(e => e.FieldId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.FieldCategories)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlacementTest>(entity =>
        {
            entity.HasKey(e => e.PlacementTestId);
            entity.ToTable("PlacementTest");

            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp with time zone");

            // ✅ SỬA: foreign key phải là FieldId, không phải Field
            entity.HasOne(e => e.Field)
                .WithMany(d => d.PlacementTests)
                .HasForeignKey(e => e.FieldId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlacementQuestion>(entity =>
        {
            entity.HasKey(e => e.QuestionId);
            entity.ToTable("PlacementQuestion");

            entity.Property(e => e.QuestionText).HasMaxLength(1000);
            entity.Property(e => e.AnswerOptions).HasMaxLength(2000);
            entity.Property(e => e.CorrectAnswer).HasMaxLength(5);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);

            entity.HasOne(e => e.PlacementTest)
                .WithMany(t => t.PlacementQuestions)
                .HasForeignKey(e => e.PlacementTestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlacementResult>(entity =>
        {
            entity.HasKey(e => e.ResultId);
            entity.ToTable("PlacementResult");

            entity.Property(e => e.Level).HasMaxLength(50);
            entity.Property(e => e.CompletedAt).HasColumnType("timestamp with time zone");

            entity.HasOne(e => e.Account)
                .WithMany()
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(e => e.PlacementTest)
                .WithMany(t => t.PlacementResults)
                .HasForeignKey(e => e.PlacementTestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlacementAnswer>(entity =>
        {
            entity.HasKey(e => e.AnswerId);
            entity.ToTable("PlacementAnswer");

            entity.Property(e => e.SelectedAnswer).HasMaxLength(5);

            entity.HasOne(e => e.PlacementResult)
                .WithMany(r => r.PlacementAnswers)
                .HasForeignKey(e => e.ResultId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.PlacementQuestion)
                .WithMany(q => q.PlacementAnswers)
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<CourseLevel>(entity =>
        {
            entity.HasKey(e => e.CourseLevelId);
            entity.ToTable("CourseLevel");
            entity.Property(e => e.Level).HasMaxLength(150);

            entity.HasOne(e => e.Course)
                  .WithMany(c => c.CourseLevels)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CatgoryId);

            entity.ToTable("Category");

            entity.Property(e => e.Description)
                .HasMaxLength(450);
            entity.Property(e => e.Name)
                .HasMaxLength(155);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId);

            entity.ToTable("Course");

            entity.Property(e => e.CreateAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(450)
                .HasColumnName("ImageURL");
            entity.Property(e => e.PublicAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("Title");
            entity.Property(e => e.TotalDuration)
                .HasMaxLength(155);
            entity.Property(e => e.UpdateAt).HasColumnType("timestamp with time zone");
            entity.Property(e => e.VideoPreviewUrl)
                .HasMaxLength(450)
                .HasColumnName("VideoPreviewURL");
            entity.HasOne(d => d.Account).WithMany(p => p.Courses)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_Course_Account")
                .OnDelete(DeleteBehavior.NoAction); ;
        });

        modelBuilder.Entity<CourseCategory>(entity =>
        {
            entity.HasKey(e => e.CourseCategoryId);
            entity.ToTable("CourseCategory");

            entity.HasIndex(e => e.CategoryId, "IX_CourseCategory_CategoryId");

            entity.HasIndex(e => e.CourseId, "IX_CourseCategory_CourseId");

            entity.Property(e => e.CategoryId);
            entity.Property(e => e.CourseId);

            entity.HasOne(d => d.Category).WithMany(p => p.CourseCategories)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_CourseCategory_Category");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseCategories)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_CourseCategory_Course");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);
            entity.ToTable("Notification");

            entity.HasIndex(e => e.AccountId, "IX_Notification_AccountId");

            entity.Property(e => e.AccountId);
            entity.Property(e => e.Message)
                .HasMaxLength(450);
            entity.Property(e => e.SendDate).HasColumnType("timestamp with time zone");

            entity.HasOne(d => d.Account).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_Notification_Accounts");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId);
            entity.ToTable("Order");

            entity.HasIndex(e => e.AccountId, "IX_Order_AccountId");

            entity.HasIndex(e => e.CourseId, "IX_Order_CourseId");

            entity.Property(e => e.AccountId);
            entity.Property(e => e.AccountName)
                .HasMaxLength(155);
            entity.Property(e => e.CourseId);
            entity.Property(e => e.CurrencyCode)
                .HasMaxLength(55);
            entity.Property(e => e.PaymentDate).HasColumnType("timestamp with time zone");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(155);
            entity.Property(e => e.Status)
                .HasMaxLength(55);
            entity.Property(e => e.TransactionNo)
                .HasMaxLength(155);

            entity.HasOne(d => d.Account).WithMany(p => p.Orders)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_Order_Accounts");

            entity.HasOne(d => d.Course).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Order_Course");
        });

        modelBuilder.Entity<RatingCourse>(entity =>
        {
            entity.HasKey(e => e.RatingId);

            entity.ToTable("RatingCourse");

            entity.HasIndex(e => e.RegistrationId, "IX_RatingCourse_RegistrationId");

            entity.Property(e => e.CommentContent)
                .HasMaxLength(255);
            entity.Property(e => e.RatingDate).HasColumnType("timestamp with time zone");
            entity.Property(e => e.RegistrationId);

            entity.HasOne(d => d.Registration).WithMany(p => p.RatingCourses)
                .HasForeignKey(d => d.RegistrationId)
                .HasConstraintName("FK_RatingCourse_RegistrationCourse");
        });

        modelBuilder.Entity<RegistrationCourse>(entity =>
        {
            entity.HasKey(e => e.RegistrationId);

            entity.ToTable("RegistrationCourse");

            entity.HasIndex(e => e.AccountId, "IX_RegistrationCourse_AccountId");

            entity.HasIndex(e => e.CourseId, "IX_RegistrationCourse_CourseId");

            entity.Property(e => e.AccountId);
            entity.Property(e => e.CourseId);
            entity.Property(e => e.EnrollmentDate).HasColumnType("timestamp with time zone");

            entity.HasOne(d => d.Account).WithMany(p => p.RegistrationCourses)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_RegistrationCourse_Accounts");

            entity.HasOne(d => d.Course).WithMany(p => p.RegistrationCourses)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_RegistrationCourse_Course");
        });

        modelBuilder.Entity<ReportProblem>(entity =>
        {
            entity.HasKey(e => e.ReportId);

            entity.ToTable("ReportProblem");

            entity.HasIndex(e => e.AccountId, "IX_ReportProblem_AccountId");

            entity.Property(e => e.AccountId).IsRequired();
            entity.Property(e => e.CreateDate).HasColumnType("timestamp with time zone");
            entity.Property(e => e.Description)
                .HasMaxLength(450);
            entity.Property(e => e.ProcessingDate).HasColumnType("timestamp with time zone");
            entity.Property(e => e.ReportStatus)
                .HasMaxLength(50);
            entity.Property(e => e.Title)
                .HasMaxLength(155);
            entity.Property(e => e.Type)
                .HasMaxLength(50);

            entity.HasOne(d => d.Account).WithMany(p => p.ReportProblems)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_ReportProblem_Accounts");
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.SectionId);
            entity.ToTable("Section");

            entity.HasIndex(e => e.CourseId, "IX_Section_CourseId");

            entity.Property(e => e.CourseId);
            entity.Property(e => e.Title)
                .HasMaxLength(155);

            entity.HasOne(d => d.Course).WithMany(p => p.Sections)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Section_Course");
        });

        modelBuilder.Entity<Step>(entity =>
        {
            entity.HasKey(e => e.StepId);
            entity.ToTable("Step");

            entity.HasIndex(e => e.SectionId, "IX_Step_SectionId");
            entity.Property(e => e.SectionId);

            entity.HasIndex(e => e.QuizId, "IX_Step_QuizId");
            entity.Property(e => e.QuizId);

            entity.Property(e => e.StepDescription)
                .HasMaxLength(450);
            entity.Property(e => e.Title)
                .HasMaxLength(155);
            entity.Property(e => e.VideoUrl)
                .HasMaxLength(255);

            entity.HasOne(d => d.Section).WithMany(p => p.Steps)
                .HasForeignKey(d => d.SectionId)
                .HasConstraintName("FK_Step_Section");

            entity.HasOne(d => d.Quiz).WithMany(p => p.Steps)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK_Step_Quiz");
        });

        modelBuilder.Entity<StepCompleted>(entity =>
        {
            entity.HasKey(e => e.CompletedStepId);

            entity.ToTable("StepCompleted");

            entity.HasIndex(e => e.RegistrationId, "IX_StepCompleted_RegistrationId");

            entity.Property(e => e.DateCompleted).HasColumnType("timestamp with time zone");
            entity.Property(e => e.RegistrationId);

            entity.HasOne(d => d.Registration).WithMany(p => p.StepCompleteds).HasForeignKey(d => d.RegistrationId);
        });

        modelBuilder.Entity<WishList>(entity =>
        {
            entity.HasKey(e => e.WishListId);
            entity.ToTable("WishList");

            entity.HasIndex(e => e.AccountId, "IX_WishList_AccountId");

            entity.HasIndex(e => e.CourseId, "IX_WishList_CourseId");

            entity.Property(e => e.AccountId);
            entity.Property(e => e.CourseId);

            entity.HasOne(d => d.Account).WithMany(p => p.WishLists)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_WishList_Accounts");

            entity.HasOne(d => d.Course).WithMany(p => p.WishLists)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_WishList_Course");
        });
        
        modelBuilder.Entity<LinkCertificateAccount>(entity =>
        {
            entity.HasKey(e => e.LinkCertId);
            entity.ToTable("LinkCertificateAccount");

            entity.HasIndex(e => e.AccountId, "IX_LinkCertificateAccount_AccountId");

            entity.HasIndex(e => e.CourseId, "IX_LinkCertificateAccount_CourseId");

            entity.Property(e => e.AccountId);
            entity.Property(e => e.CourseId);

            entity.HasOne(d => d.Account).WithMany(p => p.LinkCertificateAccounts)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_LinkCertificateAccount_Accounts");

            entity.HasOne(d => d.Course).WithMany(p => p.LinkCertificateAccounts)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_LinkCertificateAccount_Course");
        });
        
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.QuizId);
            entity.ToTable("Quiz");
            
            entity.Property(e => e.Title).HasMaxLength(150);

            entity.Property(e => e.Description).HasMaxLength(250);
        });
        
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.QuestionId);
            entity.ToTable("Question");

            entity.HasIndex(e => e.QuizId, "IX_Question_QuizId");
            entity.Property(e => e.QuizId);
            
            entity.HasOne(d => d.Quiz).WithMany(p => p.Questions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK_Question_Quiz");
        }); 
        
        modelBuilder.Entity<AnswerHistory>(entity =>
        {
            entity.HasKey(e => e.AnswerHistoryId);
            entity.ToTable("AnswerHistory");

            entity.HasIndex(e => e.CompletedStepId, "IX_AnswerHistory_CompletedStepId");
            entity.Property(e => e.CompletedStepId);
            
            entity.HasIndex(e => e.QuestionId, "IX_AnswerHistory_QuestionId");
            entity.Property(e => e.QuestionId);
            
            entity.HasOne(d => d.StepCompleted).WithMany(p => p.AnswerHistories)
                .HasForeignKey(d => d.CompletedStepId)
                .HasConstraintName("FK_AnswerHistory_StepCompleted");
            
            entity.HasOne(d => d.Question).WithMany(p => p.AnswerHistories)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("FK_AnswerHistory_Question");
        });

        //base.OnModelCreating(modelBuilder);
        //OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
