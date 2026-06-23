export type InspectionCategory =
  | 'scaffold'
  | 'fire'
  | 'confined'
  | 'electrical'
  | 'height'
  | 'equipment';

export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type NCStatus = 'open' | 'in-progress' | 'closed';
export type ChecklistResult = 'ok' | 'ng' | 'na';

export interface ChecklistItem {
  id: string;
  text: string;
  result: ChecklistResult;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
}

export interface NonConformance {
  id: string;
  date: string;
  inspectionArea: string;
  category: InspectionCategory;
  inspector: string;
  description: string;
  requiredAction: string;
  dueDate: string;
  severity: Severity;
  status: NCStatus;
  photos: string[];
  location: GpsLocation | null;
  checklistItems: ChecklistItem[];
  recipientName: string;
  recipientPhone: string;
  inspectorSignature: string | null;
  createdAt: string;
}

export interface InspectionTemplate {
  category: InspectionCategory;
  name: string;
  icon: string;
  color: string;
  items: string[];
  description: string;
  legalBasis?: string;
}
