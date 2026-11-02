import { Asset } from "./experience/shared";

import { Spinner } from "./spinner";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="admin-state" role="status">
      <div className="state-orbit">
        <Asset name="robot" size={72} />
        <Spinner />
      </div>
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="admin-state">
      <Asset name="note" size={88} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
