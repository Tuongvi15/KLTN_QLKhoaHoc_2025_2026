using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedb_v10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TotalIncome",
                table: "TeacherPayouts",
                newName: "TotalGross");

            migrationBuilder.RenameColumn(
                name: "NetIncome",
                table: "TeacherPayouts",
                newName: "PendingAmount");

            migrationBuilder.AddColumn<decimal>(
                name: "AvailableAmount",
                table: "TeacherPayouts",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountHolder",
                table: "TeacherPayouts",
                type: "character varying(155)",
                maxLength: 155,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BankBranch",
                table: "TeacherPayouts",
                type: "character varying(155)",
                maxLength: 155,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "NetAmount",
                table: "TeacherPayouts",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "TeacherPayouts",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableAmount",
                table: "TeacherPayouts");

            migrationBuilder.DropColumn(
                name: "BankAccountHolder",
                table: "TeacherPayouts");

            migrationBuilder.DropColumn(
                name: "BankBranch",
                table: "TeacherPayouts");

            migrationBuilder.DropColumn(
                name: "NetAmount",
                table: "TeacherPayouts");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "TeacherPayouts");

            migrationBuilder.RenameColumn(
                name: "TotalGross",
                table: "TeacherPayouts",
                newName: "TotalIncome");

            migrationBuilder.RenameColumn(
                name: "PendingAmount",
                table: "TeacherPayouts",
                newName: "NetIncome");
        }
    }
}
