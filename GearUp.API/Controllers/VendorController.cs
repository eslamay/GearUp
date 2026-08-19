using GearUp.API.DTOs;
using GearUp.API.Extensions;
using GearUp.API.Services;
using GearUp.Core.Entities;
using GearUp.Core.Enum;
using GearUp.Core.Interfaces;
using GearUp.Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Vendor")]
    public class VendorController(IUnitOfWork unit, IFileUploadService fileUploadService) : BaseApiController
    {
        [HttpGet("products")]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetVendorProducts([FromQuery] ProductSpecParams productParams)
        {
            var vendorId = User.GetUserId();
            var spec = new VendorProductSpecification(vendorId!, productParams);

            return await CreatePagedResult(unit.Repository<Product>(), spec,
                productParams.PageIndex, productParams.PageSize);
        }

        [HttpPost("products")]
        public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto productDto, IFormFile? file)
        {
            try
            {
                var pictureUrl = await ResolvePictureUrlAsync(file, productDto.PictureUrl);

                var product = new Product
                {
                    Name = productDto.Name,
                    Description = productDto.Description,
                    Price = productDto.Price,
                    PictureUrl = pictureUrl,
                    Type = productDto.Type,
                    Brand = productDto.Brand,
                    QuantityInStock = productDto.QuantityInStock,
                    Status = ProductStatus.Pending,
                    VendorId = User.GetUserId(),
                    CreatedAt = DateTime.UtcNow
                };

                unit.Repository<Product>().Add(product);

                if (await unit.Complete())
                
                    return CreatedAtAction(nameof(GetVendorProducts), new { id = product.Id }, product);
                
                return BadRequest("Problem creating product");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<string> ResolvePictureUrlAsync(IFormFile? file, string? pictureUrl)
        {
            if (file != null)
                return await fileUploadService.UploadProductImageAsync(file);

            if (!string.IsNullOrEmpty(pictureUrl))
                return pictureUrl.StartsWith("data:")
                    ? await fileUploadService.UploadProductImageFromDataUrlAsync(pictureUrl)
                    : pictureUrl;

            throw new ArgumentException("Product image is required");
        }
    }
}
