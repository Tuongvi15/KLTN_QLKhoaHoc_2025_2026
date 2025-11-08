using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedb_v4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
    name: "FK_PlacementResult_Accounts_AccountId1",
    table: "PlacementResult");

            migrationBuilder.DropColumn(
                name: "AccountId1",
                table: "PlacementResult");

            migrationBuilder.AddForeignKey(
                name: "FK_PlacementResult_Accounts_AccountId",
                table: "PlacementResult",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
