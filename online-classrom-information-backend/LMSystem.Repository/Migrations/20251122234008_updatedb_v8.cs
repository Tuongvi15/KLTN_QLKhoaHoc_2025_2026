using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LMSystem.Repository.Migrations
{
    /// <inheritdoc />
    public partial class updatedb_v8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlacementTest_Field_FieldId",
                table: "PlacementTest");

            migrationBuilder.DropTable(
                name: "FieldCategory");

            migrationBuilder.DropTable(
                name: "Field");

            migrationBuilder.RenameColumn(
                name: "FieldId",
                table: "PlacementTest",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_PlacementTest_FieldId",
                table: "PlacementTest",
                newName: "IX_PlacementTest_CategoryId");

            migrationBuilder.AddColumn<int>(
                name: "PlacementResultResultId",
                table: "Category",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Category_PlacementResultResultId",
                table: "Category",
                column: "PlacementResultResultId");

            migrationBuilder.AddForeignKey(
                name: "FK_Category_PlacementResult_PlacementResultResultId",
                table: "Category",
                column: "PlacementResultResultId",
                principalTable: "PlacementResult",
                principalColumn: "ResultId");

            migrationBuilder.AddForeignKey(
                name: "FK_PlacementTest_Category_CategoryId",
                table: "PlacementTest",
                column: "CategoryId",
                principalTable: "Category",
                principalColumn: "CatgoryId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Category_PlacementResult_PlacementResultResultId",
                table: "Category");

            migrationBuilder.DropForeignKey(
                name: "FK_PlacementTest_Category_CategoryId",
                table: "PlacementTest");

            migrationBuilder.DropIndex(
                name: "IX_Category_PlacementResultResultId",
                table: "Category");

            migrationBuilder.DropColumn(
                name: "PlacementResultResultId",
                table: "Category");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "PlacementTest",
                newName: "FieldId");

            migrationBuilder.RenameIndex(
                name: "IX_PlacementTest_CategoryId",
                table: "PlacementTest",
                newName: "IX_PlacementTest_FieldId");

            migrationBuilder.CreateTable(
                name: "Field",
                columns: table => new
                {
                    FieldId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
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
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    FieldId = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_FieldCategory_CategoryId",
                table: "FieldCategory",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldCategory_FieldId",
                table: "FieldCategory",
                column: "FieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_PlacementTest_Field_FieldId",
                table: "PlacementTest",
                column: "FieldId",
                principalTable: "Field",
                principalColumn: "FieldId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
