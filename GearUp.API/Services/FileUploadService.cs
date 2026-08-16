using System.Text.RegularExpressions;

namespace GearUp.API.Services
{

    public class FileUploadService : IFileUploadService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _productImagesPath;
        private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        private static readonly string[] AllowedMimeTypes =
            ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB

        public FileUploadService(IWebHostEnvironment environment)
        {
            _environment = environment;

            // storage location: API/wwwroot/images/products
            _productImagesPath = Path.Combine(_environment.WebRootPath, "images", "products");

            if (!Directory.Exists(_productImagesPath))
            {
                Directory.CreateDirectory(_productImagesPath);
            }
        }

        public async Task<string> UploadProductImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!AllowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.");

            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException("File size too large. Maximum size is 10MB.");

            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_productImagesPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/images/products/{fileName}";
        }

        public async Task<string> UploadProductImageFromDataUrlAsync(string dataUrl)
        {
            if (string.IsNullOrEmpty(dataUrl))
                throw new ArgumentException("Data URL is empty or null");

            var match = Regex.Match(dataUrl, @"^data:([^;]+);base64,(.+)$");
            if (!match.Success)
                throw new ArgumentException("Invalid data URL format");

            var mimeType = match.Groups[1].Value.ToLowerInvariant();
            var base64Data = match.Groups[2].Value;

            if (!AllowedMimeTypes.Contains(mimeType))
                throw new ArgumentException("Invalid image type. Only JPG, PNG, GIF, and WebP are allowed.");

            var imageBytes = Convert.FromBase64String(base64Data);

            if (imageBytes.Length > MaxFileSizeBytes)
                throw new ArgumentException("File size too large. Maximum size is 10MB.");

            var extension = mimeType switch
            {
                "image/jpeg" or "image/jpg" => ".jpg",
                "image/png" => ".png",
                "image/gif" => ".gif",
                "image/webp" => ".webp",
                _ => ".jpg"
            };

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_productImagesPath, fileName);

            await File.WriteAllBytesAsync(filePath, imageBytes);

            return $"/images/products/{fileName}";
        }

        public void DeleteProductImageAsync(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return;

            var fileNameOnly = Path.GetFileName(fileName);
            if (string.IsNullOrEmpty(fileNameOnly))
                return;

            var filePath = Path.Combine(_productImagesPath, fileNameOnly);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }

}
