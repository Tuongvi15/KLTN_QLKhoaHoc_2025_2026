using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedb_v9 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TeacherPayouts",
                columns: table => new
                {
                    PayoutId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<string>(type: "text", nullable: false),
                    TotalIncome = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    NetIncome = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    BankName = table.Column<string>(type: "character varying(155)", maxLength: 155, nullable: false),
                    BankAccountNumber = table.Column<string>(type: "character varying(155)", maxLength: 155, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherPayout", x => x.PayoutId);
                    table.ForeignKey(
                        name: "FK_TeacherPayouts_Accounts_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TeacherPayouts_TeacherId",
                table: "TeacherPayouts",
                column: "TeacherId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeacherPayouts");
        }
    }
}
