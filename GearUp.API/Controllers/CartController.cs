using GearUp.Core.Entities;
using GearUp.Core.Enum;
using GearUp.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController(ICartService cartService, IUnitOfWork unit) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<ShoppingCart>> GetCartById(string id)
        {
            var cart = await cartService.GetCartAsync(id);

            return Ok(cart ?? new ShoppingCart { Id = id });
        }

        [HttpPost("items")]
        public async Task<ActionResult<ShoppingCart>> AddItemToCart(string cartId, int productId, int quantity)
        {
            var product = await unit.Repository<Product>().GetByIdAsync(productId);
            if (product == null)
                return NotFound("Product not found");

            if (product.Status != ProductStatus.Approved)
                return BadRequest("Product is not available");

            if (quantity > product.QuantityInStock)
                return BadRequest($"Only {product.QuantityInStock} items available in stock");

            var cart = await cartService.GetCartAsync(cartId) ?? new ShoppingCart { Id = cartId };

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Price = product.Price,           
                    PictureUrl = product.PictureUrl,
                    Brand = product.Brand,
                    Type = product.Type,
                    Quantity = quantity
                });
            }

            var updatedCart = await cartService.SetCartAsync(cart);
            return updatedCart == null ? BadRequest("Problem updating cart") : updatedCart;
        }

        [HttpDelete]
        public async Task DeleteCart(string id)
        {
            await cartService.DeleteCartAsync(id);
        }
    }
}
