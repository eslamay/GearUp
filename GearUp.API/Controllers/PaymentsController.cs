using GearUp.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
    }
}
