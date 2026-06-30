FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["SmartCampusBus.Api.csproj", "./"]
RUN dotnet restore "SmartCampusBus.Api.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "SmartCampusBus.Api.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .

# Render exposes PORT environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SmartCampusBus.Api.dll"]
