using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedbb_v18 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CertificateAccounts_CertificateTemplates_TemplateId",
                table: "CertificateAccounts");

            migrationBuilder.DropIndex(
                name: "IX_CertificateAccounts_TemplateId",
                table: "CertificateAccounts");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "CertificateAccounts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "CertificateAccounts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CertificateAccounts_TemplateId",
                table: "CertificateAccounts",
                column: "TemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_CertificateAccounts_CertificateTemplates_TemplateId",
                table: "CertificateAccounts",
                column: "TemplateId",
                principalTable: "CertificateTemplates",
                principalColumn: "TemplateId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
