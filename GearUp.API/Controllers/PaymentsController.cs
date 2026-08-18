using GearUp.Core.Entities.OrderAggregate;
using GearUp.Core.Enum;
using GearUp.Core.Interfaces;
using GearUp.Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace GearUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : BaseApiController
    {
        private readonly IPaymentService _paymentService;
        private readonly IUnitOfWork _unit;
        private readonly ILogger<PaymentsController> _logger;
        private readonly string _whSecret;

        public PaymentsController(IPaymentService paymentService,
            IUnitOfWork unit,
            ILogger<PaymentsController> logger,
            IConfiguration config)
        {
            _paymentService = paymentService;
            _unit = unit;
            _logger = logger;
            _whSecret = config["Stripe:WebhookSecret"]!;
        }

        [Authorize]
        [HttpPost("{cartId}")]
        public async Task<ActionResult> CreateOrUpdatePaymentIntent(string cartId)
        {
            var cart = await _paymentService.CreateOrUpdatePaymentIntent(cartId);
            if (cart == null) return BadRequest("Problem with your cart on the API");
            return Ok(cart);
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _whSecret);

                if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    if (stripeEvent.Data.Object is PaymentIntent intent)
                    {
                        await HandlePaymentIntentSucceeded(intent);
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in the Stripe webhook.");
                return StatusCode(500);
            }
        }

        private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
        {
            _logger.LogInformation("[WEBHOOK] Payment Succeeded event received for: {PaymentIntentId}", intent.Id);
            var spec = new OrderSpecification(intent.Id, true);
            var order = await _unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null)
            {
                _logger.LogError("[WEBHOOK] Order with PaymentIntentId {PaymentIntentId} was NOT FOUND.", intent.Id);
                return;
            }

            if (order.Status == OrderStatus.Pending)
            {
                _logger.LogInformation("[WEBHOOK] Order {OrderId} status is 'Pending'. Updating to 'PaymentReceived'.", order.Id);
                order.Status = OrderStatus.PaymentReceived;
                await _unit.Complete();
            }
        }
    }
}
