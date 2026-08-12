using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Enum
{
    public enum ProductStatus
    {
        Pending,    // Waiting for admin approval
        Approved,   // Approved by admin (visible to customers)
        Rejected,   // Rejected by admin
        Suspended   // Suspended by admin
    }
}
