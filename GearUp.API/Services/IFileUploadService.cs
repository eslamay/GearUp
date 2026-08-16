namespace GearUp.API.Services
{
    public interface IFileUploadService
    {
        Task<string> UploadProductImageAsync(IFormFile file);
        Task<string> UploadProductImageFromDataUrlAsync(string dataUrl);
        void DeleteProductImageAsync(string fileName);
    }
}
