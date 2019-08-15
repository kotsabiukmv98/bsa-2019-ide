﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Text;
using IDE.BLL.JWT;
using IDE.BLL.Services;
using IDE.BLL.Interfaces;
using IDE.BLL.MappingProfiles;
using System;

namespace IDE.BLL
{
    public static class BLLConfigurations
    {
        public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<JWTFactory>();

            services.AddScoped<AuthService>();
            services.AddScoped<UserService>();
            services.AddScoped<IProjectMemberSettingsService, ProjectMemberSettingsService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IProjectStructureService, ProjectStructureService>();

            services.AddScoped<FileService>();
            services.AddScoped<FileHistoryService>();
            services.AddScoped<ProjectStructureService>();

            RegisterHttpClientFactories(services, configuration);
            RegisterAutoMapper(services);
        }

        public static void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {

        }

        private static void RegisterAutoMapper(IServiceCollection services)
        {
            services.AddAutoMapper(cfg =>
            {
                cfg.AddProfile<UserProfile>();
                cfg.AddProfile<ProjectProfile>();
                cfg.AddProfile<ImageProfile>();
                cfg.AddProfile<BuildProfile>();
                cfg.AddProfile<FileProfile>();
                cfg.AddProfile<FileHistoryProfile>();
                cfg.AddProfile<GitCredentialProfile>();
                cfg.AddProfile<ProjectStructureProfile>();
            });
        }

        private static void RegisterHttpClientFactories(IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpClient<IImageUploader, ImgurUploaderService>(client =>
            {
                var imgurClientId = configuration["BsaIdeImgurClientId"];
                var imgurApiUrl = configuration.GetSection("ImgurApiUrl").Value;

                client.BaseAddress = new Uri(imgurApiUrl);
                client.DefaultRequestHeaders.Add("Authorization", $"Client-ID {imgurClientId}");
            });
        }
    }
}