import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string, type: string): SafeResourceUrl {
    // If it's a YouTube video, convert the URL
    if (type === 'VIDEO_LINK') {
      let video_id = '';
      if (url.includes('v=')) {
        video_id = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        video_id = url.split('youtu.be/')[1];
      }

      const embed_url = `https://www.youtube.com/embed/${video_id}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embed_url);
    }

    // If it's an Image or PDF hosted on our server
    if (type === 'IMAGE' || type === 'PDF') {
      // Point to our Spring Boot static folder
      const full_url = `http://localhost:8080/uploads/${url}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(full_url);
    }

    // Default return
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
