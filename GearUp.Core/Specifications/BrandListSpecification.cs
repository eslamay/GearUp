using GearUp.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Specifications
{
    public class BrandListSpecification : BaseSpecification<Product, string>
    {
        public BrandListSpecification()
        {
            AddSelect(x => x.Brand);
            ApplyDistinct();
        }
    }
}
