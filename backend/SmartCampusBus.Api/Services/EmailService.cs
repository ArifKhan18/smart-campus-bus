using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace SmartCampusBus.Api.Services;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string otpCode, string userName);
}

public class EmailService : IEmailService
{
    private readonly string _resendApiKey;
    private readonly string _senderEmail;
    private readonly HttpClient _httpClient;

    public EmailService(IConfiguration configuration)
    {
        _resendApiKey = configuration["EmailSettings:ResendApiKey"] ?? "";
        _senderEmail = configuration["EmailSettings:SenderEmail"] ?? "onboarding@resend.dev";
        _httpClient = new HttpClient();
    }

    public async Task SendOtpEmailAsync(string toEmail, string otpCode, string userName)
    {
        if (string.IsNullOrEmpty(_resendApiKey))
        {
            throw new Exception("Resend API Key is not configured. Set EmailSettings:ResendApiKey.");
        }

        var htmlBody = $@"
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
            <div style='text-align: center; margin-bottom: 30px;'>
                <h1 style='color: #6C63FF; margin-bottom: 0;'>Smart Campus Bus</h1>
                <p style='color: #777; margin-top: 5px;'>Account Verification</p>
            </div>
            
            <p>Hello <strong>{userName}</strong>,</p>
            <p>Thank you for registering! Please use the following One-Time Password (OTP) to verify your email address and activate your account.</p>
            
            <div style='background-color: #f4f4f9; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;'>
                <h2 style='letter-spacing: 5px; color: #333; font-size: 32px; margin: 0;'>{otpCode}</h2>
            </div>
            
            <p style='color: #555; font-size: 14px;'>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            
            <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;' />
            <p style='text-align: center; color: #888; font-size: 12px;'>
                &copy; {DateTime.UtcNow.Year} Smart Campus Bus. All rights reserved.
            </p>
        </body>
        </html>";

        var payload = new
        {
            from = $"Smart Campus Bus <{_senderEmail}>",
            to = new[] { toEmail },
            subject = "Verify your account - Smart Campus Bus",
            html = htmlBody
        };

        var json = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("Authorization", $"Bearer {_resendApiKey}");

        var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Resend API error ({response.StatusCode}): {responseBody}");
        }
    }
}
