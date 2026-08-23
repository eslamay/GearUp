import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Pipe({
  name: 'imageUrl'
})
export class ImageUrlPipe implements PipeTransform {

  transform(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path; 
    return `${environment.apiBaseUrl}${path}`;
  }

}
