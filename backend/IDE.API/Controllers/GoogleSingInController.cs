﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Auth0.AuthenticationApi;
using Auth0.AuthenticationApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using IDE.Common.ModelsDTO.DTO.Authentification;
using IDE.Common.Enums;

namespace IDE.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class GoogleSingInController : ControllerBase
    {
        [HttpGet("google")]
        public void GoogleAuth()
        {
            SocialAuth(SocialProvider.Google);
        }

        [HttpGet("gitHub")]
        public void GitHubAuth()
        {
            SocialAuth(SocialProvider.GitHub);
        }

        [HttpPost("callback")]
        public async Task<IActionResult> CallbackAsync([FromHeader] AuthAccessTokenDTO token)
        {
            if (token.access_token == null)
                return BadRequest();

            var apiClient = new AuthenticationApiClient(new Uri("https://bsa-ide.eu.auth0.com"));
            var userInfo = await apiClient.GetUserInfoAsync(token.access_token);

            return Ok(userInfo);
        }

        private IActionResult SocialAuth(SocialProvider socialProvider)
        {
            var client = new AuthenticationApiClient(new Uri("https://bsa-ide.eu.auth0.com"));
            var socialProviderString = string.Empty;
            switch (socialProvider)
            {
                case SocialProvider.Google:
                    socialProviderString = "google-oauth2";
                    break;
                case SocialProvider.GitHub:
                    socialProviderString = "github";
                    break;
                default:
                    return BadRequest();
            }

            var authorizationUrl = client.BuildAuthorizationUrl()
                .WithResponseType(AuthorizationResponseType.Token)
                .WithResponseMode(AuthorizationResponseMode.FormPost)
                .WithClient("oDlrdb7kNboqqGbWPMzZvlxgHQul87Nh")
                .WithConnection(socialProviderString)
                .WithRedirectUrl("https://localhost:44352/GoogleSingIn/callback")
                .WithScope("openid profile email offline_access")
                .Build();

            return Redirect(authorizationUrl.ToString());
        }

    }
}