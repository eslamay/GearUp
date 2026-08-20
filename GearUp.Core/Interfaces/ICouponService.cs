using GearUp.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Interfaces
{
    public interface ICouponService
    {
        Task<AppCoupon?> GetCouponFromPromoCode(string code);
    }
}
