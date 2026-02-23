import Spinner from "./Spinner";

function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="ui-loading-state" role="status" aria-live="polite">
      <Spinner />
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;
