import { NotificationStatus } from '../enum/en.enum';

export class TrackNotificationDto {
  supplierId: string;
  notificationId: string;
  dataId: string;
  sentOn: string;
  content: string;
  status: NotificationStatus;
  attachments?: any[];
}
