using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

namespace SmartCampusBus.Api.Config;

/// <summary>
/// Helper class to initialize Firebase Admin SDK.
/// Reads configuration from appsettings.json.
/// </summary>
public static class FirebaseSetup
{
    /// <summary>
    /// Initializes the Firebase Admin SDK.
    /// If a service account key file path is provided in config, uses it.
    /// Otherwise, initializes with default credentials (for deployed environments).
    /// </summary>
    public static void Initialize(IConfiguration configuration)
    {
        // Prevent re-initialization
        if (FirebaseApp.DefaultInstance != null)
        {
            return;
        }

        var serviceAccountKeyPath = configuration["Firebase:ServiceAccountKeyPath"];
        
        if (!File.Exists(serviceAccountKeyPath))
        {
            serviceAccountKeyPath = "/etc/secrets/serviceAccountKey.json";
        }

        if (!string.IsNullOrEmpty(serviceAccountKeyPath) && File.Exists(serviceAccountKeyPath))
        {
            // Initialize with service account key file
#pragma warning disable CS0618 // GoogleCredential.FromFile is marked obsolete but replacement is not yet available
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile(serviceAccountKeyPath),
                ProjectId = configuration["Firebase:ProjectId"]
            });
#pragma warning restore CS0618

            Console.WriteLine("✅ Firebase Admin SDK initialized with service account key.");
        }
        else
        {
            // Initialize with default credentials or project ID only
            FirebaseApp.Create(new AppOptions
            {
                ProjectId = configuration["Firebase:ProjectId"]
            });

            Console.WriteLine("⚠️ Firebase Admin SDK initialized without service account key.");
            Console.WriteLine("   → Add your serviceAccountKey.json path in appsettings.json");
        }
    }
}
