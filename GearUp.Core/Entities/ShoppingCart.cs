using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Entities
{
    public class ShoppingCart
    {
        public required string Id { get; set; }
        public List<CartItem> Items { get; set; } = [];
    }
}
