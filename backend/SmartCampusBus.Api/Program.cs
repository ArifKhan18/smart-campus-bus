using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using SmartCampusBus.Api.Config;

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

// ── Add Controllers ──
builder.Services.AddControllers();

var app = builder.Build();

// ── Middleware Pipeline ──
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.MapControllers();

// ── Health Check Endpoint ──
app.MapGet("/", () => new
{
    status = "running",
    service = "Smart Campus Bus API",
    timestamp = DateTime.UtcNow
});

app.Run();
