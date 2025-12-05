using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class update_db_v13 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminResponse",
                table: "ReportProblem",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ArticleId",
                table: "ReportProblem",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CommentId",
                table: "ReportProblem",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcessedBy",
                table: "ReportProblem",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminResponse",
                table: "ReportProblem");

            migrationBuilder.DropColumn(
                name: "ArticleId",
                table: "ReportProblem");

            migrationBuilder.DropColumn(
                name: "CommentId",
                table: "ReportProblem");

            migrationBuilder.DropColumn(
                name: "ProcessedBy",
                table: "ReportProblem");
        }
    }
}
