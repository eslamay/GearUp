using GearUp.API.DTOs;
using GearUp.API.Extensions;
using GearUp.API.SignalR;
using GearUp.Core.Entities;
using GearUp.Core.Entities.OrderAggregate;
using GearUp.Core.Enum;
using GearUp.Core.Interfaces;
using GearUp.Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController(
    ICartService cartService,
    IUnitOfWork unit,
    IHubContext<NotificationHub> hubContext) : BaseApiController
    {
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            var email = User.GetEmail();
            var cart = await cartService.GetCartAsync(orderDto.CartId);

            if (cart == null) return BadRequest("Cart not found");
            if (cart.PaymentIntentId == null) return BadRequest("No payment intent for this order");

            var items = new List<OrderItem>();
            foreach (var item in cart.Items)
            {
                var productItem = await unit.Repository<Product>().GetByIdAsync(item.ProductId);
                if (productItem == null) return BadRequest("Problem with the order");

                if (productItem.QuantityInStock < item.Quantity)
                    return BadRequest($"Not enough stock for {productItem.Name}");

                productItem.QuantityInStock -= item.Quantity;
                unit.Repository<Product>().Update(productItem);

                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    PictureUrl = item.PictureUrl
                };

                var orderItem = new OrderItem
                {
                    ItemOrdered = itemOrdered,
                    Price = productItem.Price,
                    Quantity = item.Quantity
                };

                items.Add(orderItem);
            }

            var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync(orderDto.DeliveryMethodId);
            if (deliveryMethod == null) return BadRequest("No delivery method selected");

            var order = new Order
            {
                OrderItems = items,
                DeliveryMethod = deliveryMethod,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = items.Sum(x => x.Price * x.Quantity),
                Discount = orderDto.Discount,
                PaymentSummary = orderDto.PaymentSummary,
                PaymentIntentId = cart.PaymentIntentId,
                BuyerEmail = email,
                Status = OrderStatus.PaymentReceived
            };

            unit.Repository<Order>().Add(order);

            if (await unit.Complete())
            {
                var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);
                if (!string.IsNullOrEmpty(connectionId))
                {
                    await hubContext.Clients.Client(connectionId).SendAsync("OrderCompleteNotification", order.ToDto());
                }

                return order;
            }

            return BadRequest("Problem creating order");
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
        {
            var spec = new OrderSpecification(User.GetEmail());

            var orders = await unit.Repository<Order>().ListAsync(spec);

            var ordersToReturn = orders.Select(o => o.ToDto()).ToList();

            return Ok(ordersToReturn);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var spec = new OrderSpecification(User.GetEmail(), id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return NotFound();

            return order.ToDto();
        }

        [HttpGet("delivery-methods")]
        public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
        {
            return Ok(await unit.Repository<DeliveryMethod>().ListAllAsync());
        }
    }
}
