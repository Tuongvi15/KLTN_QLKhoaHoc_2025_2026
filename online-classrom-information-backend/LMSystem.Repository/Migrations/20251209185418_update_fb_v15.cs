using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class update_fb_v15 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CvUrl",
                table: "Accounts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CvUrl",
                table: "Accounts");
        }
    }
}
