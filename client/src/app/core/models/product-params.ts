export class ProductParams {
  brands: string[] = [];
  types: string[] = [];
  sort = 'newest';
  search = '';
  status?: string;
  pageIndex = 1;
  pageSize = 20;
}