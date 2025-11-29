# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# important deploy
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj
COPY ["LMSystem.API/LMSystem.API.csproj", "LMSystem.API/"]
COPY ["LMSystem.Services/LMSystem.Services.csproj", "LMSystem.Services/"]
COPY ["LMSystem.Library/LMSystem.Library.csproj", "LMSystem.Library/"]
COPY ["LMSystem.Repository/LMSystem.Repository.csproj", "LMSystem.Repository/"]

RUN dotnet restore "./LMSystem.API/LMSystem.API.csproj"

COPY . .

WORKDIR "/src/LMSystem.API"
RUN dotnet build "./LMSystem.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./LMSystem.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "LMSystem.API.dll"]
