using LMSystem.Repository.Helpers;
using LMSystem.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Resend;
using System.Threading.Tasks;

namespace LMSystem.Services.Services
{
    public class ResendMailService : IMailService
    {
        private readonly IResend _resend;

        public ResendMailService(IConfiguration config)
        {
            _resend = ResendClient.Create(config["Resend:ApiKey"]);
        }

        public async Task SendEmailAsync(EmailRequest req)
        {
            var message = new EmailMessage
            {
                From = "eHubSystem <onboarding@estudyhub.id.vn>",
                To = req.To,
                Subject = req.Subject,
                HtmlBody = req.Content
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendConFirmEmailAsync(EmailRequest req)
        {
            var message = new EmailMessage
            {
                From = "eHubSystem <onboarding@estudyhub.id.vn>",
                To = req.To,
                Subject = req.Subject,
                HtmlBody = req.Content
            };

            await _resend.EmailSendAsync(message);
        }
    }
}
