using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedb_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Field",
                columns: table => new
                {
                    FieldId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Field", x => x.FieldId);
                });

            migrationBuilder.CreateTable(
                name: "FieldCategory",
                columns: table => new
                {
                    FieldCategoryId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FieldId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldCategory", x => x.FieldCategoryId);
                    table.ForeignKey(
                        name: "FK_FieldCategory_Category_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Category",
                        principalColumn: "CatgoryId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FieldCategory_Field_FieldId",
                        column: x => x.FieldId,
                        principalTable: "Field",
                        principalColumn: "FieldId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlacementTest",
                columns: table => new
                {
                    PlacementTestId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FieldId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlacementTest", x => x.PlacementTestId);
                    table.ForeignKey(
                        name: "FK_PlacementTest_Field_FieldId",
                        column: x => x.FieldId,
                        principalTable: "Field",
                        principalColumn: "FieldId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlacementQuestion",
                columns: table => new
                {
                    QuestionId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlacementTestId = table.Column<int>(type: "integer", nullable: false),
                    QuestionText = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    AnswerOptions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CorrectAnswer = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    DifficultyLevel = table.Column<byte>(type: "smallint", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlacementQuestion", x => x.QuestionId);
                    table.ForeignKey(
                        name: "FK_PlacementQuestion_PlacementTest_PlacementTestId",
                        column: x => x.PlacementTestId,
                        principalTable: "PlacementTest",
                        principalColumn: "PlacementTestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlacementResult",
                columns: table => new
                {
                    ResultId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountId = table.Column<string>(type: "text", nullable: false),
                    PlacementTestId = table.Column<int>(type: "integer", nullable: false),
                    Score = table.Column<double>(type: "double precision", nullable: false),
                    Level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AccountId1 = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlacementResult", x => x.ResultId);
                    table.ForeignKey(
                        name: "FK_PlacementResult_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PlacementResult_Accounts_AccountId1",
                        column: x => x.AccountId1,
                        principalTable: "Accounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PlacementResult_PlacementTest_PlacementTestId",
                        column: x => x.PlacementTestId,
                        principalTable: "PlacementTest",
                        principalColumn: "PlacementTestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlacementAnswer",
                columns: table => new
                {
                    AnswerId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResultId = table.Column<int>(type: "integer", nullable: false),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    SelectedAnswer = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlacementAnswer", x => x.AnswerId);
                    table.ForeignKey(
                        name: "FK_PlacementAnswer_PlacementQuestion_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "PlacementQuestion",
                        principalColumn: "QuestionId");
                    table.ForeignKey(
                        name: "FK_PlacementAnswer_PlacementResult_ResultId",
                        column: x => x.ResultId,
                        principalTable: "PlacementResult",
                        principalColumn: "ResultId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FieldCategory_CategoryId",
                table: "FieldCategory",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldCategory_FieldId",
                table: "FieldCategory",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementAnswer_QuestionId",
                table: "PlacementAnswer",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementAnswer_ResultId",
                table: "PlacementAnswer",
                column: "ResultId");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementQuestion_PlacementTestId",
                table: "PlacementQuestion",
                column: "PlacementTestId");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementResult_AccountId",
                table: "PlacementResult",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementResult_AccountId1",
                table: "PlacementResult",
                column: "AccountId1");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementResult_PlacementTestId",
                table: "PlacementResult",
                column: "PlacementTestId");

            migrationBuilder.CreateIndex(
                name: "IX_PlacementTest_FieldId",
                table: "PlacementTest",
                column: "FieldId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FieldCategory");

            migrationBuilder.DropTable(
                name: "PlacementAnswer");

            migrationBuilder.DropTable(
                name: "PlacementQuestion");

            migrationBuilder.DropTable(
                name: "PlacementResult");

            migrationBuilder.DropTable(
                name: "PlacementTest");

            migrationBuilder.DropTable(
                name: "Field");
        }
    }
}
