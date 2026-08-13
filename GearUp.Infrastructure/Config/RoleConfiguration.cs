using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Infrastructure.Config
{
    public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole>
    {
        public void Configure(EntityTypeBuilder<IdentityRole> builder)
        {
            builder.HasData(
                new IdentityRole { Id = "admin-id", Name = "Admin", NormalizedName = "ADMIN", ConcurrencyStamp = "admin-concurrency-stamp" },
                new IdentityRole { Id = "customer-id", Name = "Customer", NormalizedName = "CUSTOMER", ConcurrencyStamp = "customer-concurrency-stamp" },
                new IdentityRole { Id = "vendor-id", Name = "Vendor", NormalizedName = "VENDOR", ConcurrencyStamp = "vendor-concurrency-stamp" }

            );
        }
    }
}
