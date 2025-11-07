namespace LMSystem.API.Helper
{
    public class MailTemplate
    {
        public static string ConfirmTemplate(string email, string token)
        {
            string body =
                         $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset=""utf-8"" />
                            <title>Confirm Email</title>
                        </head>
                        <body>
                            <div class=""container"">
                                <div class=""header"">
                                    <img src=""https://firebasestorage.googleapis.com/v0/b/estudyhub-a1699.appspot.com/o/logo%2Flogo-black.png?alt=media&token=892e67fd-fa5a-4a95-8705-de863eb9afe5"" alt=""Logo"" style=""width:120px;"">
                                </div>
                                <div class=""content"">
                                    <h3>Xác thực Account của bạn</h3>
                                    <p style=""font-size: 15px;"">Bạn đã đăng ký {email} tại eStudyHub Online System.</p>
                                    <p style=""font-size: 15px;"">Để xác thực địa chỉ email của bạn hãy nhấn vào nút bên dưới.</p>
                                    <div class=""push-button"">
                                        <a href=""{token}"" style=""background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;""><strong>XÁC NHẬN</strong></a>
                                    </div>
                                    <div class=""note"">
                                        <p style=""font-size: 15px; font-style: italic;"">* Lưu ý: Tài khoản chỉ có thể đăng nhập được khi đã xác thực.</p>
                                    </div>
                                </div>
                                <div class=""footer"">
                                    <div class=""info"">
                                        <p>Liên lạc đến estudyhubservice@gmail.com để hiểu rõ hơn.</p>
                                    </div>
                                </div>
                            </div>
                        </body>
                ";
            return body;

        }

        public static string ConfirmTCTemplate()
        {
            string body = $@"
                <!DOCTYPE html>
                <head>
                    <meta charset=""utf-8"" />
                    <title>Đăng ký thành công</title>
                </head>
                <body>
                    <div style=""container"">
                        <div style=""header"">
                            <img src=""https://png.pngtree.com/png-vector/20230823/ourlarge/pngtree-the-graduation-cap-and-spoon-icon-vector-png-image_6913781.png""alt=""Logo"" style=""width:120px;"">
                        </div>
                        <div style=""content"">
                            <h3>Đăng ký tài khoản thành công</h3>
                            <p style=""font-size: 15px;"">Bạn đã đăng ký trở thành Giảng viên tại eStudyHub.</p>
                            <p style=""font-size: 15px;"">Hiện tại bạn đã có thể đăng nhập vào hệ thống để bắt đầu cuộc hành trình của mình.</p>
                            <p style=""font-size: 15px; font-style: italic;"">Chúc bạn có trải nghiệm tuyệt vời với eStudyHub.</p>
                            <div style=""note"">
                                <p style=""font-size: 15px; padding-top: 40px;font-style: italic;"">* Lưu ý: Tài khoản chỉ có thể đăng nhập được khi đã được chứng thực.</p>
                            </div>
                        </div>
                        <div style=""footer"">
                            <div style=""info"">
                                <p>Liên lạc đến estudyhub@gmail.com để hiểu rõ hơn.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>";
            return body;
        }
    }
}