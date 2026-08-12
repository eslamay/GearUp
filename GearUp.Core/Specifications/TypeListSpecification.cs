using GearUp.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Specifications
{
    public class TypeListSpecification : BaseSpecification<Product, string>
    {
        public TypeListSpecification()
        {
            AddSelect(x => x.Type);
            ApplyDistinct();
        }
    }
}
