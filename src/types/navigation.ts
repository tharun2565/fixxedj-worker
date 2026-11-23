export type GenderOption = 'Male' | 'Female' | 'Other';

export type JobParam = {
  id: string;
  title: string;
  category: string;
  fare: string;
  customer: string;
  distance: string;
  eta: string;
  address: string;
  area: string;
  issue?: string;
  photos?: string[];
};

export type BillLine = {
  id: string;
  name: string;
  price: number;
  kind: 'service' | 'part';
  qty?: number;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  FaceVerification:
    | {
        faceCaptured?: boolean;
        facePhotoUri?: string;
      }
    | undefined;
  FaceCamera: undefined;
  KycVerification: {
    fullName: string;
    dob: string;
    gender: GenderOption;
  };
  SelectExpertise: {
    gender: GenderOption;
  };
  WaitingVerification: undefined;
  HubSchedule: undefined;
  CaptainVerified: undefined;
  MainTabs: undefined;
  JobDetails: {
    job: JobParam;
  };
  ActiveJob: {
    job: JobParam;
  };
  Payment: {
    job: JobParam;
    lines: BillLine[];
    total: number;
  };
  JobCompleted: {
    job: JobParam;
    lines: BillLine[];
    total: number;
    paymentMethod: 'upi' | 'cash';
  };
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Services: undefined;
  Wallet: undefined;
};
