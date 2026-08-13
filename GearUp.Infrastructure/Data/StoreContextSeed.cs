using GearUp.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using System.Text.Json;

namespace GearUp.Infrastructure.Data
{
    public class StoreContextSeed
    {
        public static async Task SeedAsync(StoreContext context, UserManager<AppUser> userManager,
               IConfiguration config)
        {
            //Admin
            var adminConfig = config.GetSection("SeedUsers:Admin");

            var adminUserName = adminConfig["UserName"];
            var adminEmail = adminConfig["Email"];
            var adminPassword = adminConfig["Password"];

            if (!string.IsNullOrWhiteSpace(adminUserName) &&
                !string.IsNullOrWhiteSpace(adminEmail) &&
                !string.IsNullOrWhiteSpace(adminPassword))
            {
                var admin = await userManager.FindByNameAsync(adminUserName);

                if (admin == null)
                {
                    admin = new AppUser
                    {
                        UserName = adminUserName,
                        Email = adminEmail,
                        EmailConfirmed = true
                    };

                    var result = await userManager.CreateAsync(
                        admin,
                        adminPassword);

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            string.Join(", ",
                                result.Errors.Select(x => x.Description)));
                    }
                }

                if (!await userManager.IsInRoleAsync(admin, "Admin"))
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }

            //Vendor
            var vendorConfig = config.GetSection("SeedUsers:Vendor");

            var vendorUserName = vendorConfig["UserName"];
            var vendorEmail = vendorConfig["Email"];
            var vendorPassword = vendorConfig["Password"];

            if (!string.IsNullOrWhiteSpace(vendorUserName) &&
                !string.IsNullOrWhiteSpace(vendorEmail) &&
                !string.IsNullOrWhiteSpace(vendorPassword))
            {
                var vendor = await userManager.FindByNameAsync(vendorUserName);

                if (vendor == null)
                {
                    vendor = new AppUser
                    {
                        FirstName = vendorConfig["FirstName"] ?? "",
                        LastName = vendorConfig["LastName"] ?? "",
                        UserName = vendorUserName,
                        Email = vendorEmail,
                        EmailConfirmed = true
                    };

                    var result = await userManager.CreateAsync(
                        vendor,
                        vendorPassword);

                    if (!result.Succeeded)
                    {
                        throw new Exception(
                            string.Join(", ",
                                result.Errors.Select(x => x.Description)));
                    }
                }

                if (!await userManager.IsInRoleAsync(vendor, "Vendor"))
                {
                    await userManager.AddToRoleAsync(vendor, "Vendor");
                }
            }

            //Products
            var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

            if (!context.Products.Any())
            {
                var productsData = await File.ReadAllTextAsync(path + @"/Data/SeedData/products.json");
                var products = JsonSerializer.Deserialize<List<Product>>(productsData);

                if (products == null) return;

                context.Products.AddRange(products);

                await context.SaveChangesAsync();
            }
        }
    }
}
