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
    private readonly string _brevoApiKey;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly HttpClient _httpClient;

    public EmailService(IConfiguration configuration)
    {
        _brevoApiKey = configuration["EmailSettings:BrevoApiKey"] ?? "";
        _senderEmail = configuration["EmailSettings:SenderEmail"] ?? "";
        _senderName = "Smart Campus Bus";
        _httpClient = new HttpClient();
    }

    public async Task SendOtpEmailAsync(string toEmail, string otpCode, string userName)
    {
        if (string.IsNullOrEmpty(_brevoApiKey))
        {
            throw new Exception("Brevo API Key is not configured. Set EmailSettings:BrevoApiKey.");
        }
        if (string.IsNullOrEmpty(_senderEmail))
        {
            throw new Exception("Sender Email is not configured. Set EmailSettings:SenderEmail.");
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
            sender = new { name = _senderName, email = _senderEmail },
            to = new[] { new { email = toEmail, name = userName } },
            subject = "Verify your account - Smart Campus Bus",
            htmlContent = htmlBody
        };

        var json = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("api-key", _brevoApiKey);

        var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"Brevo API error ({response.StatusCode}): {responseBody}");
        }
    }
}
