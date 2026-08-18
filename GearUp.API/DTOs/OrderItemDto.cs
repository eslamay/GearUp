using System.ComponentModel.DataAnnotations;

namespace GearUp.API.DTOs
{
    public class OrderItemDto
    {
        public int ProductId { get; set; }
        [Required]
        public string ProductName { get; set; } = string.Empty;
        [Required]
        public string PictureUrl { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}