
using NSwag;
using NSwag.Generation.Processors.Security;

namespace GearUp.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
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

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
