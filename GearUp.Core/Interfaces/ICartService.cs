using GearUp.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Interfaces
{
    public interface ICartService
    {
        Task<ShoppingCart?> GetCartAsync(string cartId);
        Task<ShoppingCart?> SetCartAsync(ShoppingCart cart);
        Task<bool> DeleteCartAsync(string cartId);
    }
}
