export class ProductParams {
  brands: string[] = [];
  types: string[] = [];
  sort = 'newest';
  search = '';
  pageIndex = 1;
  pageSize = 20;
}