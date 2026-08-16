using GearUp.API.DTOs;
using GearUp.Core.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(SignInManager<AppUser> signInManager) : BaseApiController
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto registerDto)
        {
            var allowedRoles = new[] { "Customer", "Vendor" };
            if (!allowedRoles.Contains(registerDto.Role))
            {
                return BadRequest("Invalid role selected");
            }

            var user = new AppUser
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                UserName = registerDto.Username
            };

            var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem();
            }

            await signInManager.UserManager.AddToRoleAsync(user, registerDto.Role);

            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDto loginDto)
        {
            var user = await signInManager.UserManager.FindByEmailAsync(loginDto.Email);

            if (user == null)
            {
                user = await signInManager.UserManager.FindByNameAsync(loginDto.Email);
            }

            if (user == null)
            {
                return Unauthorized("Invalid email/username or password");
            }
            var result = await signInManager.PasswordSignInAsync(user, loginDto.Password, false, false);

            if (result.Succeeded)
            {
                return Ok(new { message = "Login successful" });
            }

            return Unauthorized("Invalid email/username or password");
        }
    }
}
