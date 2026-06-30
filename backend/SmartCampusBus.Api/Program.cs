using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using SmartCampusBus.Api.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using SmartCampusBus.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── CORS Configuration ──
// Allow frontend (Live Server) to make requests to this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5501"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ── Firebase Admin SDK Initialization ──
FirebaseSetup.Initialize(builder.Configuration);

// ── Register Firestore as Singleton ──
builder.Services.AddSingleton(provider =>
{
    var projectId = builder.Configuration["Firebase:ProjectId"];
    return FirestoreDb.Create(projectId);
});

// ── Add Services ──
builder.Services.AddScoped<SmartCampusBus.Api.Services.IAuthService, SmartCampusBus.Api.Services.AuthService>();
builder.Services.AddScoped<SmartCampusBus.Api.Services.IBusService, SmartCampusBus.Api.Services.BusService>();
builder.Services.AddScoped<SmartCampusBus.Api.Services.IRouteService, SmartCampusBus.Api.Services.RouteService>();
builder.Services.AddScoped<SmartCampusBus.Api.Services.IScheduleService, SmartCampusBus.Api.Services.ScheduleService>();
builder.Services.AddScoped<SmartCampusBus.Api.Services.IAnnouncementService, SmartCampusBus.Api.Services.AnnouncementService>();

// ── Authentication & Authorization ──
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var projectId = builder.Configuration["Firebase:ProjectId"];
        options.Authority = $"https://securetoken.google.com/{projectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{projectId}",
            ValidateAudience = true,
            ValidAudience = projectId,
            ValidateLifetime = true
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var authService = context.HttpContext.RequestServices.GetRequiredService<IAuthService>();
                var uid = context.Principal?.FindFirst("user_id")?.Value;
                if (!string.IsNullOrEmpty(uid))
                {
                    var user = await authService.GetUserAsync(uid);
                    if (user != null && !string.IsNullOrEmpty(user.Role))
                    {
                        var claims = new List<Claim>
                        {
                            new Claim(ClaimTypes.Role, user.Role)
                        };
                        var appIdentity = new ClaimsIdentity(claims);
                        context.Principal?.AddIdentity(appIdentity);
                    }
                }
            }
        };
    });

builder.Services.AddAuthorization();

// ── Add Controllers ──
builder.Services.AddControllers();

var app = builder.Build();

// ── Middleware Pipeline ──
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Health Check Endpoint ──
app.MapGet("/", () => new
{
    status = "running",
    service = "Smart Campus Bus API",
    timestamp = DateTime.UtcNow
});

app.Run();
