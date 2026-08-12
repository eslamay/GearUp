using Microsoft.AspNetCore.Identity;
using System.Net;

namespace GearUp.Core.Entities
{
    public class AppUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public Address? Address { get; set; }
    }
}