import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { IncomingJob } from '../components/IncomingJobCard';
import { playJobAlert } from '../utils/jobAlert';

const JOB_POOL: IncomingJob[] = [
  {
    id: '104829',
    title: 'Ceiling Fan & Switch Sparking Fix',
    category: 'Electrical Repair',
    fare: '₹299',
    customer: 'Rahul S.',
    distance: '2.4 km',
    eta: '~8 mins',
    address: 'Flat 302, Green Glen Layout, 4th Block',
    area: 'Koramangala',
    issue:
      'Ceiling fan making loud humming noise and sparks from bedroom regulator switch.',
    photos: [
      'https://picsum.photos/seed/fixxedj-fan/400/300',
      'https://picsum.photos/seed/fixxedj-switch/400/300',
    ],
  },
  {
    id: '104841',
    title: 'Kitchen Sink Leak & Tap Replacement',
    category: 'Plumbing',
    fare: '₹349',
    customer: 'Ananya M.',
    distance: '1.8 km',
    eta: '~6 mins',
    address: 'House 12, 2nd Cross, Indiranagar',
    area: 'Indiranagar',
    issue: 'Kitchen mixer tap leaking from base and under-sink joint dripping.',
    photos: [
      'https://picsum.photos/seed/fixxedj-sink/400/300',
      'https://picsum.photos/seed/fixxedj-tap/400/300',
    ],
  },
  {
    id: '104856',
    title: 'AC Not Cooling – Service Visit',
    category: 'Appliances',
    fare: '₹499',
    customer: 'Vikram P.',
    distance: '3.1 km',
    eta: '~12 mins',
    address: 'Tower B, Prestige Lakeside, Whitefield',
    area: 'Whitefield',
    issue: 'Split AC running but air is not cool. Indoor unit making noise.',
    photos: [
      'https://picsum.photos/seed/fixxedj-ac/400/300',
      'https://picsum.photos/seed/fixxedj-acunit/400/300',
    ],
  },
];

export type CompletedJobNote = {
  id: string;
  title: string;
  customer: string;
  category: string;
  amount: number;
  /** ISO date-time for grouping */
  completedAt: string;
  /** Display time e.g. 04:32 pm */
  at: string;
};

function daysAgo(n: number, hour = 11, minute = 20) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function noteFrom(
  job: Pick<IncomingJob, 'id' | 'title' | 'customer' | 'category' | 'fare'>,
  when: Date,
): CompletedJobNote {
  const amount = Number(String(job.fare).replace(/[^\d]/g, '')) || 0;
  return {
    id: job.id,
    title: job.title,
    customer: job.customer,
    category: job.category,
    amount,
    completedAt: when.toISOString(),
    at: when.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/** Seed history so Bookings looks like Paytm-style ledger on first open */
const SEED_HISTORY: CompletedJobNote[] = [
  noteFrom(JOB_POOL[0], daysAgo(0, 9, 15)),
  noteFrom(JOB_POOL[1], daysAgo(0, 14, 40)),
  noteFrom(JOB_POOL[2], daysAgo(1, 11, 5)),
  noteFrom(
    { ...JOB_POOL[0], id: '104701', customer: 'Sneha K.' },
    daysAgo(3, 16, 22),
  ),
  noteFrom(
    { ...JOB_POOL[1], id: '104688', customer: 'Arjun D.' },
    daysAgo(5, 10, 48),
  ),
  noteFrom(
    { ...JOB_POOL[2], id: '104650', customer: 'Meera R.' },
    daysAgo(12, 13, 10),
  ),
  noteFrom(
    { ...JOB_POOL[0], id: '104612', customer: 'Karthik N.' },
    daysAgo(28, 17, 35),
  ),
  noteFrom(
    { ...JOB_POOL[1], id: '104580', customer: 'Divya S.' },
    daysAgo(32, 12, 5),
  ),
];

type DutyContextValue = {
  onDuty: boolean;
  setOnDuty: (value: boolean) => void;
  incoming: IncomingJob | null;
  secondsLeft: number;
  jobInProgress: boolean;
  completedJobs: CompletedJobNote[];
  acceptJob: () => IncomingJob | null;
  declineJob: () => void;
  finishActiveJob: (job: IncomingJob) => void;
};

const DutyContext = createContext<DutyContextValue | null>(null);

export function DutyProvider({ children }: { children: ReactNode }) {
  const [onDuty, setOnDutyState] = useState(true);
  const [incoming, setIncoming] = useState<IncomingJob | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [jobInProgress, setJobInProgress] = useState(false);
  const [completedJobs, setCompletedJobs] = useState<CompletedJobNote[]>(SEED_HISTORY);
  const jobIndexRef = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    busyRef.current = jobInProgress;
  }, [jobInProgress]);

  const setOnDuty = useCallback((value: boolean) => {
    setOnDutyState(value);
    if (!value) {
      setIncoming(null);
      setSecondsLeft(10);
    }
  }, []);

  const declineJob = useCallback(() => {
    setIncoming(null);
    setSecondsLeft(10);
  }, []);

  const acceptJob = useCallback(() => {
    const job = incoming;
    setIncoming(null);
    setSecondsLeft(10);
    if (job) {
      setJobInProgress(true);
      busyRef.current = true;
    }
    return job;
  }, [incoming]);

  const finishActiveJob = useCallback((job: IncomingJob) => {
    setJobInProgress(false);
    busyRef.current = false;
    const when = new Date();
    setCompletedJobs((prev) =>
      [noteFrom(job, when), ...prev].slice(0, 80),
    );
  }, []);

  useEffect(() => {
    if (!onDuty) return;

    const spawn = () => {
      if (busyRef.current) return;
      setIncoming((current) => {
        if (current || busyRef.current) return current;
        const job = JOB_POOL[jobIndexRef.current % JOB_POOL.length];
        jobIndexRef.current += 1;
        setSecondsLeft(10);
        setTimeout(() => playJobAlert(), 0);
        return job;
      });
    };

    if (!busyRef.current) {
      spawn();
    }
    const interval = setInterval(spawn, 10000);
    return () => clearInterval(interval);
  }, [onDuty, jobInProgress]);

  useEffect(() => {
    if (!incoming || !onDuty || jobInProgress) return;
    const countdown = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIncoming(null);
          return 10;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [incoming, onDuty, jobInProgress]);

  const value = useMemo(
    () => ({
      onDuty,
      setOnDuty,
      incoming,
      secondsLeft,
      jobInProgress,
      completedJobs,
      acceptJob,
      declineJob,
      finishActiveJob,
    }),
    [
      onDuty,
      setOnDuty,
      incoming,
      secondsLeft,
      jobInProgress,
      completedJobs,
      acceptJob,
      declineJob,
      finishActiveJob,
    ],
  );

  return <DutyContext.Provider value={value}>{children}</DutyContext.Provider>;
}

export function useDuty() {
  const ctx = useContext(DutyContext);
  if (!ctx) {
    throw new Error('useDuty must be used within DutyProvider');
  }
  return ctx;
}
