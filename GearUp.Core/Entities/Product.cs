using GearUp.Core.Enum;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Entities
{
    public class Product : BaseEntity
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public required string PictureUrl { get; set; }
        public required string Type { get; set; }
        public required string Brand { get; set; }
        public int QuantityInStock { get; set; }

        //vendor attributes
        public ProductStatus Status { get; set; } = ProductStatus.Approved;
        public string? VendorId { get; set; } // optional
        public AppUser? Vendor { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// Checks if the product is new (created within the last 7 days)
        public bool IsNew()
        {
            return CreatedAt >= DateTime.UtcNow.AddDays(-7);
        }
    }
}
