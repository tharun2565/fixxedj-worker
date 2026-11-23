export type TradeId = 'electrician' | 'plumber' | 'appliances' | 'maid';

type OnboardingMeta = {
  applicationId: string;
  trades: TradeId[];
  experience: string | null;
  hubId: string | null;
  hubLabel: string | null;
  slotLabel: string | null;
};

function makeApplicationId() {
  return `FC-APP-${Math.floor(10000 + Math.random() * 90000)}`;
}

let meta: OnboardingMeta = {
  applicationId: makeApplicationId(),
  trades: [],
  experience: null,
  hubId: null,
  hubLabel: null,
  slotLabel: null,
};

export function getOnboardingMeta(): OnboardingMeta {
  return { ...meta, trades: [...meta.trades] };
}

export function setOnboardingMeta(partial: Partial<OnboardingMeta>) {
  meta = {
    ...meta,
    ...partial,
    trades: partial.trades ? [...partial.trades] : meta.trades,
  };
}

export function ensureApplicationId(): string {
  if (!meta.applicationId) {
    meta.applicationId = makeApplicationId();
  }
  return meta.applicationId;
}

export function resetOnboardingMeta() {
  meta = {
    applicationId: makeApplicationId(),
    trades: [],
    experience: null,
    hubId: null,
    hubLabel: null,
    slotLabel: null,
  };
}
