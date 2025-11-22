using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddApproveCourse_v6 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlacementAnswer_PlacementQuestion_QuestionId",
                table: "PlacementAnswer");

            migrationBuilder.AddForeignKey(
                name: "FK_PlacementAnswer_PlacementQuestion_QuestionId",
                table: "PlacementAnswer",
                column: "QuestionId",
                principalTable: "PlacementQuestion",
                principalColumn: "QuestionId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlacementAnswer_PlacementQuestion_QuestionId",
                table: "PlacementAnswer");

            migrationBuilder.AddForeignKey(
                name: "FK_PlacementAnswer_PlacementQuestion_QuestionId",
                table: "PlacementAnswer",
                column: "QuestionId",
                principalTable: "PlacementQuestion",
                principalColumn: "QuestionId");
        }
    }
}
