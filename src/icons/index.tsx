import {
  HouseLine,
  Trophy,
  UserCircle,
  ChatsTeardrop,
  Calendar,
  Bell,
  GearSix,
  Plus,
  MagnifyingGlass,
  SlidersHorizontal,
  CaretRight,
  Star,
  Clock,
  MapPin,
  ShoppingBagOpen,
  Package,
  ListChecks,
  CheckCircle,
  XCircle,
  ArrowClockwise,
  IconWeight,
} from 'phosphor-react';

export const icons = {
  home: HouseLine,
  leaderboard: Trophy,
  profile: UserCircle,
  chat: ChatsTeardrop,
  calendar: Calendar,
  bell: Bell,
  settings: GearSix,
  plus: Plus,
  search: MagnifyingGlass,
  filter: SlidersHorizontal,
  caretRight: CaretRight,
  star: Star,
  clock: Clock,
  pin: MapPin,
  bag: ShoppingBagOpen,
  pkg: Package,
  checklist: ListChecks,
  success: CheckCircle,
  error: XCircle,
  refresh: ArrowClockwise,
};

export type IconKey = keyof typeof icons;

type IconProps = {
  name: IconKey;
  size?: number;
  weight?: IconWeight;
  className?: string;
};

export const Icon = ({ name, size = 20, weight = 'bold', className = '' }: IconProps) => {
  const Cmp = icons[name];
  return <Cmp size={size} weight={weight} className={className} />;
};
