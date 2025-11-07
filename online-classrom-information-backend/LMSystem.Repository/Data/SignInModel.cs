using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;

public class SignInModel
{
    [JsonPropertyName("accountEmail")]
    [Required(ErrorMessage = "Email can not be blank!"), EmailAddress(ErrorMessage = "Please enter valid email!")]
    public string AccountEmail { get; set; }

    [JsonPropertyName("accountPassword")]
    [Required(ErrorMessage = "Password can not be blank!")]
    public string AccountPassword { get; set; }
}
