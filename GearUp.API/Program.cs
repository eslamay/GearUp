
using GearUp.Core.Entities;
using GearUp.Core.Interfaces;
using GearUp.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NSwag;
using NSwag.Generation.Processors.Security;
using System.Text.Json.Serialization;

namespace GearUp.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
            builder.Services.AddDbContext<StoreContext>(opt =>
            {
                opt.UseSqlServer(builder.Configuration.GetConnectionString("constr"));
            });

            // Add services for repositories and unit of work
            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApiDocument(options =>
            {
                options.DocumentName = "v1";
                options.Title = "GearUp API";
                options.Version = "v1";

                options.AddSecurity("Bearer", new NSwag.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme.",
                    Type = OpenApiSecuritySchemeType.Http,
                    In = OpenApiSecurityApiKeyLocation.Header,
                    Name = "Authorization",
                    Scheme = "Bearer"
                });

                options.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("Bearer"));
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                // Serve the OpenAPI/Swagger JSON at /openapi/v1.json
                app.UseOpenApi(settings => settings.Path = "/openapi/v1.json");

                // Serve the NSwag UI; point the UI to the JSON above
                app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "GearUp API"));
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.MapControllers();

            try
            {
                using var scope = app.Services.CreateScope();
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<StoreContext>();
                await context.Database.MigrateAsync();
                await StoreContextSeed.SeedAsync(context);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            app.Run();
        }
    }
}
