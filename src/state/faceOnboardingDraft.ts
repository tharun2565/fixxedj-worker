import type { GenderOption } from '../types/navigation';

export type FaceOnboardingDraft = {
  fullName: string;
  dob: string;
  gender: GenderOption | '';
  photoUri?: string;
  captured: boolean;
  aadhaar?: string;
  pan?: string;
};

let draft: FaceOnboardingDraft = {
  fullName: '',
  dob: '',
  gender: '',
  photoUri: undefined,
  captured: false,
  aadhaar: undefined,
  pan: undefined,
};

export function getFaceDraft(): FaceOnboardingDraft {
  return { ...draft };
}

export function setFaceDraft(partial: Partial<FaceOnboardingDraft>) {
  draft = { ...draft, ...partial };
}

export function clearFaceDraft() {
  draft = {
    fullName: '',
    dob: '',
    gender: '',
    photoUri: undefined,
    captured: false,
    aadhaar: undefined,
    pan: undefined,
  };
}
