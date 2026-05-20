import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Impure pipe to capture dynamic signal-driven updates
})
export class TranslatePipe implements PipeTransform {
  private readonly langService = inject(LanguageService);

  transform(key: string, params?: Record<string, any>): string {
    return this.langService.translate(key, params);
  }
}
