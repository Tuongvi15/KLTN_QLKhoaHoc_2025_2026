using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMSystem.Repository.Data
{
    public class AddCourseModel
    {
        public string? Title { get; set; }

        [Required(ErrorMessage = "Description is required!")]
        public string? Description { get; set; }
        [Required(ErrorMessage = "ImageUrl is required!")]
        public string? ImageUrl { get; set; }
        public string? AccountId { get; set; }
        public string? SuitableLevels { get; set; }

        public string? VideoPreviewUrl { get; set; }

        [Required(ErrorMessage = "Price is required!")]
        public double Price { get; set; }

        [Required(ErrorMessage = "SalesCampaign is required!")]
        public double SalesCampaign { get; set; }

        [Required(ErrorMessage = "IsPublic is required!")]
        public bool IsPublic { get; set; }

        public int TotalDuration { get; set; }
        public string? CourseLevel { get; set; }

        public bool CourseIsActive { get; set; }
        public string? KnowdledgeDescription { get; set; }

        public string? LinkCertificated {  get; set; }

        [Required(ErrorMessage = "CategoryList is required!")]
        public List<int>? CategoryList { get; set; }
    }
}
