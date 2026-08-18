
using GearUp.API.Middleware;
using GearUp.API.Services;
using GearUp.API.SignalR;
using GearUp.Core.Entities;
using GearUp.Core.Interfaces;
using GearUp.Infrastructure.Data;
using GearUp.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NSwag;
using NSwag.Generation.Processors.Security;
using StackExchange.Redis;
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

            // Add identity
            builder.Services.AddAuthorization();
            builder.Services.AddIdentityApiEndpoints<AppUser>(options => {
                options.SignIn.RequireConfirmedAccount = false;
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;

                // Allow login with either username or email
                options.User.RequireUniqueEmail = true;
                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<StoreContext>();

            // Add Redis
            builder.Services.AddSingleton<IConnectionMultiplexer>(config =>
            {
                var connectionString = builder.Configuration.GetConnectionString("Redis")
                    ?? throw new Exception("Cannot get redis connection string");
                var configuation = ConfigurationOptions.Parse(connectionString, true);
                return ConnectionMultiplexer.Connect(configuation);
            });

            // Add response caching service
            builder.Services.AddSingleton<IResponseCacheService, ResponseCacheService>();

            // Add services for repositories and unit of work
            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Add services 
            builder.Services.AddScoped<IFileUploadService, FileUploadService>();
            builder.Services.AddScoped<ICartService, CartService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApiDocument(options =>
            {
                options.DocumentName = "v1";
                options.Title = "GearUp API";
                options.Version = "v1";

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

            app.UseMiddleware<ExceptionMiddleware>();

            app.UseCors(x => x
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins("http://localhost:4200", "https://localhost:4200"));

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.MapControllers();
            app.MapHub<NotificationHub>("/hub/notifications");
            // app.MapGroup("api").MapIdentityApi<AppUser>();

            try
            {
                using var scope = app.Services.CreateScope();
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<StoreContext>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>();
                await context.Database.MigrateAsync();
                await StoreContextSeed.SeedAsync(context, userManager, builder.Configuration);
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
