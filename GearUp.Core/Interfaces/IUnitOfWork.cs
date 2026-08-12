using GearUp.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace GearUp.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity;
        Task<bool> Complete();
    }
}
