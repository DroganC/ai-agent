import { Icon, IconKey } from '../../icons';
import { Button } from './Button';

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
  <Button variant={active ? 'primary' : 'secondary'} onClick={onClick}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <Icon name={icon} size={16} weight={active ? 'fill' : 'bold'} />
      {label}
    </span>
  </Button>
);
