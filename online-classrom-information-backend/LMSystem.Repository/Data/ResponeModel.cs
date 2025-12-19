using LMSystem.Repository.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace LMSystem.Repository.Data
{
    public class ResponeModel
    {
        public string Status { get; set; } = "Success";
        public string Message { get; set; } = string.Empty;

        [IgnoreDataMember]
        [JsonIgnore]
        public string? ConfirmEmailToken { get; set; }

        public object? DataObject { get; set; }

        // ===== Constructors =====

        public ResponeModel() { }

        public ResponeModel(string status, string message)
        {
            Status = status;
            Message = message;
        }

        public ResponeModel(string status, string message, object? data)
        {
            Status = status;
            Message = message;
            DataObject = data;
        }
    }
}
