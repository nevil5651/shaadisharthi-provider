export interface Media {
  id: number;
  url: string;
  type: 'image' | 'video';
  fileSize: number;       // Add this
  fileExtension: string;
  // The backend will associate it with a service
}

export interface Service {
  id: number;
  providerId: number;
  name: string;
  description: string;
  category: string;
  price: number;
  media: Media[];
}

