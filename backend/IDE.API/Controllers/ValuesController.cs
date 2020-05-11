using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace IDE.API.Controllers
{
    [Route("[controller]")]
    [AllowAnonymous]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        public ValuesController()
        {
        }

        // GET /values
        [HttpGet]
        public ActionResult<string> Get()
        {
            return $"Hi, there) Current time is {DateTime.Now.ToString()}";
        }
    }
}
