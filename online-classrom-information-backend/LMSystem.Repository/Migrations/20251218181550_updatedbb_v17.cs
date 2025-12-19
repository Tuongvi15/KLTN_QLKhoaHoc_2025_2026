using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedbb_v17 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CertificateEnabled",
                table: "Course",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DefaultTemplateId",
                table: "Course",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CertificateTemplates",
                columns: table => new
                {
                    TemplateId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CourseId = table.Column<int>(type: "integer", nullable: true),
                    HtmlContent = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BackgroundUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateTemplate", x => x.TemplateId);
                    table.ForeignKey(
                        name: "FK_CertificateTemplates_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Course",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "CertificateAccounts",
                columns: table => new
                {
                    CertificateId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    CourseId = table.Column<int>(type: "integer", nullable: false),
                    CertificateCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StudentName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CourseTitle = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CompletionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifyUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CertificateAccount", x => x.CertificateId);
                    table.ForeignKey(
                        name: "FK_CertificateAccounts_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CertificateAccounts_CertificateTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "CertificateTemplates",
                        principalColumn: "TemplateId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CertificateAccounts_Course_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Course",
                        principalColumn: "CourseId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CertificateAccounts_CourseId",
                table: "CertificateAccounts",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateAccounts_TemplateId",
                table: "CertificateAccounts",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "UX_Certificate_Account_Course",
                table: "CertificateAccounts",
                columns: new[] { "AccountId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_Certificate_Code",
                table: "CertificateAccounts",
                column: "CertificateCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CertificateTemplates_CourseId",
                table: "CertificateTemplates",
                column: "CourseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertificateAccounts");

            migrationBuilder.DropTable(
                name: "CertificateTemplates");

            migrationBuilder.DropColumn(
                name: "CertificateEnabled",
                table: "Course");

            migrationBuilder.DropColumn(
                name: "DefaultTemplateId",
                table: "Course");
        }
    }
}
