using GearUp.API.RequestHelpers;
using GearUp.Core.Entities;
using GearUp.Core.Enum;
using GearUp.Core.Interfaces;
using GearUp.Core.Specifications;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController(IUnitOfWork unit) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts([FromQuery] ProductSpecParams productParams)
        {
            // Force status to be Approved for public shop
            productParams.Status = ProductStatus.Approved;

            var spec = new ProductSpecification(productParams);

            var result = await CreatePagedResult(unit.Repository<Product>(), spec,
                productParams.PageIndex, productParams.PageSize);

            return result;
        }

        [Cached(300)]
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var spec = new ProductSpecification(id);
            var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

            if (product == null) return NotFound();

            // Only show approved products to public
            if (product.Status != ProductStatus.Approved) return NotFound();

            return product;
        }
    }
}
