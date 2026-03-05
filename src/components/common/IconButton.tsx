import { Icon, IconKey } from '../../icons';

export const IconButton = ({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: IconKey;
  label?: string;
  onClick?: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm transition ${
      active ? 'bg-primary text-white shadow-sm' : 'bg-[#f1f2f6] text-gray-700'
    }`}
  >
    <Icon name={icon} size={16} weight={active ? 'fill' : 'bold'} />
    {label}
  </button>
);
