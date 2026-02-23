import { ReactNode } from "react";

import Card from "./Card";
import Icon from "./Icon";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="ui-empty" variant="subtle">
      <span className="ui-empty-icon">
        <Icon name="empty" size={26} />
      </span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action ? <div className="ui-empty-action">{action}</div> : null}
    </Card>
  );
}

export default EmptyState;
