using GearUp.API.DTOs;
using GearUp.API.Extensions;
using GearUp.API.RequestHelpers;
using GearUp.Core.Entities;
using GearUp.Core.Entities.OrderAggregate;
using GearUp.Core.Enum;
using GearUp.Core.Interfaces;
using GearUp.Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController(IUnitOfWork unit, IPaymentService paymentService, UserManager<AppUser> userManager) : BaseApiController
    {
        [HttpGet("orders")]
        public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery] OrderSpecParams specParams)
        {
            var spec = new OrderSpecification(specParams);

            return await CreatePagedResult(unit.Repository<Order>(),
                spec, specParams.PageIndex, specParams.PageSize, o => o.ToDto());
        }

        [HttpGet("orders/{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var spec = new OrderSpecification(id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return BadRequest("No order with that Id");

            return order.ToDto();
        }

        [HttpPost("orders/refund/{id:int}")]
        public async Task<ActionResult<OrderDto>> RefundOrder(int id)
        {
            var spec = new OrderSpecification(id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return BadRequest("No order with that Id");

            if (order.Status == OrderStatus.Pending)
                return BadRequest("Payment not received for this order");

            var result = await paymentService.RefundPayment(order.PaymentIntentId);

            if (result == "succeeded")
            {
                order.Status = OrderStatus.Refunded;

                await unit.Complete();

                return order.ToDto();
            }

            return BadRequest("Problem refunding order");
        }

        [HttpGet("products")]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetAllProducts([FromQuery] ProductSpecParams specParams)
        {
            var spec = new ProductSpecification(specParams); 

            return await CreatePagedResult(unit.Repository<Product>(), spec,
                specParams.PageIndex, specParams.PageSize);
        }

        [InvalidateCache("api/products|")]
        [HttpPost("products/{id:int}/approve")]
        public async Task<ActionResult<Product>> ApproveProduct(int id)
        {
            var product = await unit.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            product.Status = ProductStatus.Approved;

            unit.Repository<Product>().Update(product);

            if (await unit.Complete())
            {
                return product;
            }

            return BadRequest("Problem approving product");
        }

        [InvalidateCache("api/products|")]
        [HttpPost("products/{id:int}/reject")]
        public async Task<ActionResult<Product>> RejectProduct(int id)
        {
            var product = await unit.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            product.Status = ProductStatus.Rejected;

            unit.Repository<Product>().Update(product);

            if (await unit.Complete())
            {
                return product;
            }

            return BadRequest("Problem rejecting product");
        }

        [InvalidateCache("api/products|")]
        [HttpPost("products/{id:int}/suspend")]
        public async Task<ActionResult<Product>> SuspendProduct(int id)
        {
            var product = await unit.Repository<Product>().GetByIdAsync(id);

            if (product == null) return NotFound();

            product.Status = ProductStatus.Suspended;

            unit.Repository<Product>().Update(product);

            if (await unit.Complete())
            {
                return product;
            }

            return BadRequest("Problem suspending product");
        }

        [HttpGet("products/gear-up/count")]
        public async Task<ActionResult<object>> GetGearUpProductsCount()
        {
            var gearUpVendor = await userManager.FindByNameAsync("GearUp");
            if (gearUpVendor == null)
            {
                return Ok(new { count = 0 });
            }

            var spec = new VendorProductSpecification(gearUpVendor.Id);
            var products = await unit.Repository<Product>().ListAsync(spec);
            var count = products.Count;

            return Ok(new { count });
        }

        [HttpGet("products/gear-up")]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetGearUpProducts([FromQuery] ProductSpecParams specParams)
        {
            var gearUpVendor = await userManager.FindByNameAsync("GearUp");
            if (gearUpVendor == null)
            {
                return Ok(new List<Product>());
            }

            var spec = new VendorProductSpecification(gearUpVendor.Id, specParams);
            return await CreatePagedResult(unit.Repository<Product>(), spec, specParams.PageIndex, specParams.PageSize);
        }

        [HttpGet("vendors/count")]
        public async Task<ActionResult<object>> GetVendorsCount()
        {
            var totalVendors = (await userManager.GetUsersInRoleAsync("Vendor")).Count;
            return Ok(new { totalVendors });
        }

        [HttpGet("vendors")]
        public async Task<ActionResult<object>> GetVendors()
        {
            var vendors = await userManager.GetUsersInRoleAsync("Vendor");

            var vendorList = vendors.Select(v => new
            {
                id = v.Id,
                email = v.Email,
                firstName = v.FirstName,
                lastName = v.LastName,
                userName = v.UserName
            }).ToList();

            return Ok(vendorList);
        }
    }
}
