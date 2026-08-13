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
    }
}
